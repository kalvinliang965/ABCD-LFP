// this is kalvin's code
import { Investment } from "../domain/investment/Investment";
import { Scenario } from "../domain/Scenario";
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
import UserTaxData, { create_user_tax_data } from "../domain/UserTaxData";
import { simulation_logger } from "../../utils/logger/logger";
import { create_value_source } from "../../utils/ValueGenerator";
import { TaxProcessor } from "../domain/TaxProcessor";
import { WithdrawalProcessor } from "../domain/WithdrawalProcessor";
import { number } from "zod";
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
  get_roth_conversion_strategy: () => Array<string>;
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
  get_expense_withrawal_strategy: () => Array<string>;
  investment_type_manager: InvestmentTypeManager
  event_manager: EventManager,
  account_manager: AccountManager,
  setup(): void;
  advance_year(): void;
  get_after_tax_contribution_limit(): number;
  
  tax_processor: TaxProcessor;
  withdrawal_processor: WithdrawalProcessor;

  // calculate investment market value
  get_total_prev_after_tax_value: () => number;
  get_total_prev_prev_tax_value: () => number; 
  get_total_prev_non_retirement_value: () => number;

  get_annual_inflation_rate(): number;
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
  state_tax_service: StateTaxService,
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
    let total_prev_after_tax_value = 0;
    let total_prev_prev_tax_value = 0; 
    let total_prev_non_retirement_value = 0;

    let after_tax_contribution_limit = scenario.after_tax_contribution_limit;
    let annual_inflation_rate = 0;

    const get_tax_filing_status = () => tax_filing_status;
    const get_financial_goal = () => scenario.financialGoal;

    const state: SimulationState = {
      get_annual_inflation_rate: () => annual_inflation_rate,
      rmd_strategy: scenario.rmd_strategy,
      get_total_prev_after_tax_value: () => total_prev_after_tax_value,
      get_total_prev_non_retirement_value: () => total_prev_non_retirement_value,
      get_total_prev_prev_tax_value: () => total_prev_prev_tax_value,
      
      roth_conversion_opt: scenario.roth_conversion_opt,
      roth_conversion_start: scenario.roth_conversion_start,
      roth_conversion_end: scenario.roth_conversion_end,
      spending_strategy: scenario.spending_strategy,
      get_expense_withrawal_strategy: () => scenario.expense_withdrawal_strategy,
      get_roth_conversion_strategy: () => scenario.roth_conversion_strategy,
      user,
      spouse,
      get_early_withdrawal_penalty: () => early_withdrawal_penalty,
      incr_early_withdrawal_penalty: (amt: number) => {
        early_withdrawal_penalty += amt;
      },
      // get current tax info
      user_tax_data,
      get_tax_filing_status,
      get_financial_goal,
      
      get_current_year: () => current_year,
      get_start_year:() => start_year,
      setup: () => {
        annual_inflation_rate = scenario.inflation_assumption.sample();
        simulation_logger.info(`annual inflation rate: ${annual_inflation_rate}`);
        user_tax_data.advance_year();
        after_tax_contribution_limit *= (1 + annual_inflation_rate);
        simulation_logger.info(`Adjusted after tax contribution limit from inflation ${after_tax_contribution_limit}`);
        federal_tax_service.adjust_for_inflation(annual_inflation_rate);
        state_tax_service.adjust_for_inflation(annual_inflation_rate);
        investment_type_manager.resample_all();
        event_manager.reset_all();

        simulation_logger.info(`adjusted federal taxable income bracket
          ${federal_tax_service.__taxable_income_bracket.to_string()}
          `);

        simulation_logger.info(`adjusted federal capital gains bracket
          ${federal_tax_service.__capital_gains_bracket.to_string()}
          `);
        simulation_logger.info(`adjusted standard deduction
          ${federal_tax_service.__standard_deductions.to_string()}
          `);

        simulation_logger.info(`adjusted state taxable income bracket
          ${state_tax_service.__taxable_income_brackets.to_string()}
          `);
      },
      advance_year: () => {

        total_prev_after_tax_value = account_manager.get_total_after_tax_value();
        total_prev_non_retirement_value = account_manager.get_total_non_retirement_value();
        total_prev_prev_tax_value = account_manager.get_total_pre_tax_value();

        current_year++;
        if (!spouse?.is_alive) {
          tax_filing_status = TaxFilingStatus.INDIVIDUAL;
        }
      }, 
      event_manager,
      investment_type_manager,
      account_manager,

      tax_processor: new TaxProcessor(user_tax_data, federal_tax_service, state_tax_service, get_tax_filing_status),
      withdrawal_processor: new WithdrawalProcessor(account_manager, user_tax_data, user.get_age),
      
      federal_tax_service,
      state_tax_service,
      get_after_tax_contribution_limit: () => after_tax_contribution_limit,
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
