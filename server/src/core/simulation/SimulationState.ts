// this is kalvin's code
import { Investment } from "../domain/investment/Investment";
import { Scenario } from "../domain/scenario/Scenario";
import { IncomeType, TaxFilingStatus, TaxStatus} from "../Enums";
import {
  FederalTaxService,
} from "../tax/FederalTaxService";
import {
  StateTaxService,
} from "../tax/StateTaxService";
import { Event } from "../domain/event/Event";
import { AccountManager } from "../domain/AccountManager";
import { InvestmentTypeManager } from "../domain/InvestmentTypeManager";
import { EventManager } from "../domain/EventManager";
import UserTaxData, { create_user_tax_data } from "./UserTaxData";
import { simulation_logger } from "../../utils/logger/logger";
export type EventMap = Map<string, Event>;

export interface PersonDetails {
  get_age(): number;
  year_of_death: number;
  is_alive(): boolean;
}

export interface SimulationState {
  roth_conversion_opt: boolean;
  roth_conversion_start: number;
  roth_conversion_end: number;
  roth_conversion_strategy: Array<string>;
  rmd_strategy: Array<string>;
  user: PersonDetails;
  spouse?: PersonDetails;
  get_tax_filing_status(): TaxFilingStatus;
  user_tax_data: UserTaxData;
  get_current_year(): number;
  get_start_year(): number;
  get_financial_goal(): number;
  get_early_withdrawal_penalty(): number;
  incr_early_withdrawal_penalty(amt: number): void;
  federal_tax_service: FederalTaxService;
  state_tax_service: StateTaxService;
  spending_strategy: Array<string>;
  expense_withrawal_strategy: Array<string>;
  process_investment_withdrawal: (withdrawal_amount: number) => number;
  investment_type_manager: InvestmentTypeManager
  event_manager: EventManager,
  account_manager: AccountManager,
  process_tax(): number,
  setup(): void;
  advance_year(): void;
  get_after_tax_contribution_limit(): number;
  

  // calculate investment market value
  total_after_tax_value:Map<number, number>;
  total_pre_tax_value: Map<number, number>; 
  total_non_retirement_value: Map<number, number>;
}

// Create person details object
function create_person_details(
  birth_year: number,
  life_expectancy: number,
  get_current_year: () => number
): PersonDetails {
  return {
    get_age: () => get_current_year() - birth_year,
    year_of_death: birth_year + life_expectancy + 1,
    is_alive: () => get_current_year() < birth_year + life_expectancy + 1,
  };
}

// Main simulation state creation function
export async function create_simulation_state(
  scenario: Scenario,
  federal_tax_service: FederalTaxService,
  state_tax_service: StateTaxService
): Promise<SimulationState> {
  try {
    const start_year: number = new Date().getFullYear();
    let current_year: number = start_year;
    const is_married = scenario.tax_filing_status === TaxFilingStatus.COUPLE;
    let tax_filing_status = scenario.tax_filing_status;
    const user_tax_data = create_user_tax_data();
    // Create person details
    const user = create_person_details(
      scenario.user_birth_year,
      scenario.user_life_expectancy,
      () => current_year
    );
    const spouse = is_married
      ? create_person_details(
          scenario.spouse_birth_year!,
          scenario.spouse_life_expectancy!,
          () => current_year
        )
      : undefined;
    let early_withdrawal_penalty = 0;
    // Create the simulation state object
    // clone to prevent refetching from database
    
    // manager
    const event_manager = scenario.event_manager;
    const account_manager = scenario.account_manager;
    const investment_type_manager = scenario.investment_type_manager;
    
    // total investment value for given year
    const total_after_tax_value:Map<number, number> = new Map();
    const total_pre_tax_value: Map<number, number> = new Map(); 
    const total_non_retirement_value: Map<number, number> = new Map();

    let after_tax_contribution_limit = scenario.after_tax_contribution_limit;
    const state: SimulationState = {
      rmd_strategy: scenario.rmd_strategy,
      total_after_tax_value,
      total_non_retirement_value,
      total_pre_tax_value,
      
      roth_conversion_opt: scenario.roth_conversion_opt,
      roth_conversion_start: scenario.roth_conversion_start,
      roth_conversion_end: scenario.roth_conversion_end,
      spending_strategy: scenario.spending_strategy,
      expense_withrawal_strategy: scenario.expense_withrawal_strategy,
      roth_conversion_strategy: scenario.roth_conversion_strategy,
      user,
      spouse,
      get_early_withdrawal_penalty: () => early_withdrawal_penalty,
      incr_early_withdrawal_penalty: (amt: number) => {
        early_withdrawal_penalty += amt;
      },
      // get current tax info
      user_tax_data,
      get_tax_filing_status: () => tax_filing_status,
      get_financial_goal: () => scenario.financialGoal,
      
      get_current_year: () => current_year,
      get_start_year:() => start_year,
      setup: () => {
        const annual_inflation_rate = scenario.inflation_assumption.sample();
        simulation_logger.info(`annual inflation rate: ${annual_inflation_rate}`);
        user_tax_data.advance_year();
        after_tax_contribution_limit *= (1 + annual_inflation_rate);
        simulation_logger.info(`Adjusted after tax contribution limit from inflation ${after_tax_contribution_limit}`);
        federal_tax_service.adjust_for_inflation(annual_inflation_rate);
        state_tax_service.adjust_for_inflation(annual_inflation_rate);
        investment_type_manager.resample_all();
      },
      advance_year: () => {

        total_after_tax_value.set(current_year, account_manager.get_total_after_tax_value());
        total_non_retirement_value.set(current_year, account_manager.get_total_non_retirement_value());
        total_pre_tax_value.set(current_year, account_manager.get_total_pre_tax_value());

        current_year++;
        if (!spouse?.is_alive) {
          tax_filing_status = TaxFilingStatus.INDIVIDUAL;
        }
      }, 
      event_manager,
      investment_type_manager,
      account_manager,
      
      federal_tax_service,
      state_tax_service,
      get_after_tax_contribution_limit: () => after_tax_contribution_limit,
      process_investment_withdrawal: (withdrawal_amount: number) => {
        let withdrawaled=0;
        const investments = state.account_manager.all;
        for (const inv_id of state.expense_withrawal_strategy) {
          
          // withdrawaled enough money
          if (withdrawaled > withdrawal_amount) {
            console.log("success");
            return withdrawaled;
          }

          if (!investments.has(inv_id)) {
            simulation_logger.error(`Investment "${inv_id}" does not exist`);
            throw new Error(`Investment "${inv_id}" does not exist`)
          }
          const investment = investments.get(inv_id)!;
          const purchase_price = investment.get_cost_basis();
          simulation_logger.debug(`Planning to sell investment: ${inv_id}`, {
            purchase_price,
            tax_status: investment.tax_status,
          })
          simulation_logger.debug(`${withdrawal_amount - withdrawaled} left`);
          
          // we are withdrawing amount needed to reach
          const going_to_withdraw = Math.min(withdrawal_amount - withdrawaled, purchase_price);

          simulation_logger.debug(`going to withdraw ${going_to_withdraw} from ${inv_id}`);
          investment.incr_cost_basis(-going_to_withdraw);
          // step) f.i
          // if sold investment from non-retirement accont
          // we have to calculate capital gains
          if (investment.tax_status === TaxStatus.NON_RETIREMENT) {
            const fraction = (going_to_withdraw / investment.get_cost_basis());
            const gains = investment.get_value() - investment.get_cost_basis();
            const capital_gains = fraction * gains;
            state.user_tax_data.incr_cur_year_gains(capital_gains);
          } 
          
          if (investment.tax_status === TaxStatus.PRE_TAX) {
            state.user_tax_data.incr_cur_year_income(going_to_withdraw);
          }
          
          // update withrawal
          if (
            state.user.get_age() < 59 && (
              investment.tax_status === TaxStatus.PRE_TAX || 
              investment.tax_status === TaxStatus.AFTER_TAX
          )) {
            state.user_tax_data.incr_year_early_withdrawal(going_to_withdraw);
          }

          withdrawaled += going_to_withdraw;
          simulation_logger.debug(`recieved ${going_to_withdraw} from selling ${investment.id}`)
          simulation_logger.debug(`total withdrawaled: ${withdrawaled}`);
        }
        return withdrawaled;
      },
      process_tax: (): number => {
        simulation_logger.debug("Processing tax...");
        // step a: calculate previous year's federal and state income tax
        // using data from preivous year
        // in our application, 85 percent of SS are only subject to federal tax
        const fed_taxable_income = state.user_tax_data.get_cur_fed_taxable_income();
        simulation_logger.debug(`previous year total income: ${state.user_tax_data.get_prev_year_income()}`);
        simulation_logger.debug(`previous year early withdrawal: ${state.user_tax_data.get_prev_year_early_withdrawal()}`);
        simulation_logger.debug(`federal taxable income: ${fed_taxable_income}`);

        const state_taxable_income = state.user_tax_data.get_cur_year_income();
        simulation_logger.debug(`state taxable income: ${state_taxable_income}`);

        const standard_deduction = state.federal_tax_service.find_deduction(state.get_tax_filing_status());
        simulation_logger.debug(`Standard deduction: ${standard_deduction}`)

        const fed_tax = Math.max(fed_taxable_income * state.federal_tax_service.find_rate(fed_taxable_income, IncomeType.TAXABLE_INCOME, state.get_tax_filing_status()) - standard_deduction, 0);
        const state_tax = Math.max(state_taxable_income * state.state_tax_service.find_rate(state_taxable_income, state.get_tax_filing_status()), 0);
        simulation_logger.debug(`federal tax: ${fed_tax}`);
        simulation_logger.debug(`state tax: ${state_tax}`);

        // step b: calculate previous year's capital gains
        // if capital gains is negative, we move on
        let capital_gain_tax = Math.max(
          state.user_tax_data.get_prev_year_gains(),
          0,
        );
        simulation_logger.debug(`capital gains: ${capital_gain_tax}`);
        if (capital_gain_tax != 0) {
          const capital_gain_rate = state.federal_tax_service
                  .find_rate(capital_gain_tax, IncomeType.CAPITAL_GAINS, state.get_tax_filing_status());
          capital_gain_tax *= capital_gain_rate; 
        }
        simulation_logger.debug(`capital gains tax: ${capital_gain_tax}`);

        // step c: calculate previous year withdrawal tax 
        // we assume 10% early withdrawal
        const withdrawal_tax = state.user_tax_data.get_prev_year_early_withdrawal() * 0.10;
        simulation_logger.debug(`withdrawal tax: ${withdrawal_tax}`);

        const total_tax = Math.max(fed_tax + state_tax + withdrawal_tax + capital_gain_tax, 0);
        simulation_logger.info(`Successfully process tax for ${state.get_current_year() - 1}: ${total_tax}`)
        return total_tax;
      },
    };

    return state;
  } catch (error) {
    throw new Error(
      `Simulation initialization failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
