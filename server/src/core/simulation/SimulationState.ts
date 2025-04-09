import { Investment } from "../domain/investment/Investment";
import { Scenario } from "../domain/scenario/Scenario";
import { TaxFilingStatus} from "../Enums";
import {
  FederalTaxService,
  create_federal_tax_service,
} from "../tax/FederalTaxService";
import {
  StateTaxService,
} from "../tax/StateTaxService";
import { Event } from "../domain/event/Event";
import { SpendingEvent, update_expense_amount } from "./logic/ExpenseHelper";
import { create_yearly_records } from "./YearlyTaxRecords";
import { AccountManager } from "../domain/AccountManager";
import { InvestmentTypeManager } from "../domain/InvestmentTypeManager";
import { State } from "js-yaml";
import { EventManager } from "../domain/EventManager";
export type EventMap = Map<string, Event>;

export interface PersonDetails {
  get_age(): number;
  year_of_death: number;
  is_alive(): boolean;
}

export interface SimulationState {
  inflation_factor: number;
  roth_conversion_opt: boolean;
  roth_conversion_start: number;
  roth_conversion_end: number;
  roth_conversion_strategy: Array<string>;
  user: PersonDetails;
  spouse?: PersonDetails;
  get_tax_filing_status(): TaxFilingStatus;
  get_ordinary_income(): number;
  get_capital_gains_income(): number;
  get_social_security_income(): number;
  get_after_tax_contribution(): number;
  get_after_tax_contribution_limit(): number;
  incr_ordinary_income(amt: number): void;
  incr_capital_gains_income(amt: number): void;
  incr_social_security_income(amt: number): void;
  incr_after_tax_contribution(amt: number): void;
  get_current_year(): number;
  get_financial_goal(): number;
  get_early_withdrawal_penalty(): number;
  incr_early_withdrawal_penalty(amt: number): void;
  federal_tax_service: FederalTaxService;
  state_tax_service: StateTaxService;
  advance_year(): void;
  spending_strategy: Array<string>;
  expense_withrawal_strategy: Array<string>;
  process_events(): void;
  investment_type_manager: InvestmentTypeManager
  event_manager: EventManager,
  account_manager: AccountManager,
}


// //更新所有Expense的amount
// function update_all_expenses(state: SimulationState): void {
//   for (const expense of state.discretionary_expenses) {
//     update_expense_amount(expense, state.get_current_year(), state.inflation_factor);
//   }
// }

//更新mandatory和discretionary


// Organize events by type into maps for easier access
function organize_events_by_type(
  events: Event[]
): [EventMap, EventMap, EventMap, EventMap] {
  const income_events = new Map<string, Event>();
  const expense_events = new Map<string, Event>();
  const investment_events = new Map<string, Event>();
  const rebalance_events = new Map<string, Event>();

  for (const event of events) {
    switch (event.type) {
      case "income":
        income_events.set(event.name, event);
        break;
      case "expense":
        expense_events.set(event.name, event);
        break;
      case "invest":
        investment_events.set(event.name, event);
        break;
      case "rebalance":
        rebalance_events.set(event.name, event);
        break;
      default:
        throw new Error(`Invalid event type: ${event.type}`);
    }
  }

  return [income_events, expense_events, investment_events, rebalance_events];
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
    const previous_year: number = current_year - 1;
    const is_married = scenario.tax_filing_status === TaxFilingStatus.MARRIED;
    let tax_filing_status = scenario.tax_filing_status;

    // contian tax info of given year
    const yearly_records = create_yearly_records()
    // "dummy node"
    yearly_records.initialize_record(previous_year);

    let inflation_factor = scenario.inflation_assumption.sample();

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
    const event_manager = scenario.event_manager.clone();
    const account_manager = scenario.account_manager.clone();
    const investment_type_manager = scenario.investment_type_manager.clone();

    // service
    const cloned_federal_tax_service = federal_tax_service.clone();
    const cloned_state_tax_service = state_tax_service.clone();
    // Account and event organization

    const state: SimulationState = {
      inflation_factor,
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

      process_events: () => {
      
      },

      // Income getters and setters
      get_tax_filing_status: () => tax_filing_status,
      get_financial_goal: () => scenario.financialGoal,
      // get current tax info
      get_ordinary_income: () => {
        const record = yearly_records.get_record(current_year);
        if (!record) {
          console.error(`Getting ordinary income but record at ${current_year} is not initialize`)
          process.exit(1);
        }
        return record.get_ordinary_income();
      },
      get_capital_gains_income: () => {
        const record = yearly_records.get_record(current_year);
        if (!record) {
          console.error(`Gretting capital gains income but record at ${current_year} is not initialize`);
          process.exit(1);
        }
        return record.get_capital_gains_income();
      },
      get_social_security_income: () => {
        const record = yearly_records.get_record(current_year);
        if (!record) {
          console.error(`Getting social security income but record at ${current_year} is not initialize`);
          process.exit(1);
        }
        return record.get_social_security_income();
      },
      get_after_tax_contribution: () => {
        const record = yearly_records.get_record(current_year);
        if (!record) {
          console.error(`Getting after tax contribution but record at ${current_year} is not initialize`);
          process.exit(1);
        }
        return record.get_after_tax_contribution();
      },
      get_after_tax_contribution_limit: () => scenario.after_tax_contribution_limit,
      incr_ordinary_income: (amt: number) => {
        const record = yearly_records.get_record(current_year);
        if (!record) {
          console.error(`incrementing ordinary income but record at ${current_year} is not initialize`);
          process.exit(1);
        }
        return record.incr_ordinary_income(amt);
      },
      incr_capital_gains_income: (amt: number) => {
        const record = yearly_records.get_record(current_year);
        if (!record) {
          console.error(`incrementing security income but record at ${current_year} is not initialize`);
          process.exit(1);
        }
        return record.incr_capital_gains_income(amt);
      },
      incr_social_security_income: (amt: number) => {
        const record = yearly_records.get_record(current_year);
        if (!record) {
          console.error(`incrementing social security income but record at ${current_year} is not initialize`);
          process.exit(1);
        }
        return record.incr_social_security_income(amt);
      },
      incr_after_tax_contribution: (amt: number) => {
        const record = yearly_records.get_record(current_year);
        if (!record) {
          console.error(`incrementing after tax contribution but record at ${current_year} is not initialize`);
          process.exit(1);
        }
        return record.incr_after_tax_contribution(amt);
      },

      get_current_year: () => current_year,
      advance_year: () => {
        current_year++;
        const annual_inflation_rate = scenario.inflation_assumption.sample();
        inflation_factor *= 1 + annual_inflation_rate;
        cloned_federal_tax_service.adjust_for_inflation(annual_inflation_rate);
        cloned_state_tax_service.adjust_for_inflation(annual_inflation_rate);
        investment_type_manager.resample_all();
        if (!spouse?.is_alive) {
          tax_filing_status = TaxFilingStatus.SINGLE;
        }
      }, 
      event_manager,
      investment_type_manager,
      account_manager,
      
      federal_tax_service: cloned_federal_tax_service,
      state_tax_service: cloned_state_tax_service,
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
