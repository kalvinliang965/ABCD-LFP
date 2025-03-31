import { Investment } from "../domain/investment/Investment";
import { Scenario } from "../domain/scenario/Scenario";
import { TaxFilingStatus, TaxStatus, ChangeType, IncomeType } from "../Enums";
import {
  FederalTaxService,
  create_federal_tax_service,
} from "../tax/FederalTaxService";
import {
  StateTaxService,
  create_state_tax_service,
} from "../tax/StateTaxService";
import { Event } from "../domain/event/Event";
import { SpendingEvent, update_expense_amount } from "./logic/ExpenseHelper";
import { create_yearly_records } from "./YearlyTaxRecords";

export type AccountMap = Map<string, Investment>;
export type EventMap = Map<string, Event>;

export interface PersonDetails {
  get_age(): number;
  year_of_death: number;
  is_alive(): boolean;
}

export interface SimulationState {
  events: Array<Event>;
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
  accounts: {
    non_retirement: AccountMap;
    pre_tax: AccountMap;
    after_tax: AccountMap;
  };
  events_by_type: {
    income: EventMap;
    expense: EventMap;
    invest: EventMap;
    rebalance: EventMap;
  };
  spending_strategy: Array<string>;
  expense_withrawal_strategy: Array<string>;
  process_events(): void;
  cash: Investment;
  mandatory_expenses: SpendingEvent[];
  discretionary_expenses: SpendingEvent[];
}

// Parse investments by tax status
function parse_investments(
  investments: Investment[]
): [Investment, AccountMap, AccountMap, AccountMap] {
  let cash_account = undefined;
  const non_retirement_account = new Map<string, Investment>();
  const pre_tax_account = new Map<string, Investment>();
  const after_tax_account = new Map<string, Investment>();

  for (const investment of investments) {
    switch (investment.taxStatus) {
      case TaxStatus.NON_RETIREMENT:
        if (investment.id == "cash") {
          cash_account = investment;
        } else {
          non_retirement_account.set(investment.id, investment);
        }
        break;
      case TaxStatus.PRE_TAX:
        pre_tax_account.set(investment.id, investment);
        break;
      case TaxStatus.AFTER_TAX:
        after_tax_account.set(investment.id, investment);
        break;
      default:
        throw new Error(`Invalid tax status: ${investment.taxStatus}`);
    }
  }

  if (!cash_account) {
    console.log("cash investment not found");
    process.exit(1);
  }

  return [
    cash_account,
    non_retirement_account,
    pre_tax_account,
    after_tax_account,
  ];
}

//更新所有Expense的amount
function update_all_expenses(state: SimulationState): void {
  for (const expense of state.discretionary_expenses) {
    update_expense_amount(expense, state.get_current_year(), state.inflation_factor);
  }
}

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
  scenario: Scenario
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

    // Process investments - scenario.investments is already processed in create_scenario
    const [cash, non_retirement, pre_tax, after_tax] = parse_investments(
      scenario.investments
    );
    // Organize events by type - scenario.eventSeries is already processed in create_scenario
    const [income_events, expense_events, investment_events, rebalance_events] =
      organize_events_by_type(scenario.event_series);
    let inflation_factor = scenario.inflation_assumption.sample();

    // Create tax services
    const federal_tax_service = await create_federal_tax_service();
    const state_tax_service = await create_state_tax_service();
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
    const state: SimulationState = {
      cash,
      events: scenario.event_series,
      inflation_factor,
      roth_conversion_opt: scenario.roth_conversion_opt,
      roth_conversion_start: scenario.roth_conversion_start,
      roth_conversion_end: scenario.roth_conversion_end,
      spending_strategy: scenario.spending_strategy,
      expense_withrawal_strategy: scenario.expense_withrawal_strategy,
      mandatory_expenses: scenario.mandatory_expenses,
      discretionary_expenses: scenario.discretionary_expenses,
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
      federal_tax_service,
      state_tax_service,
      advance_year: () => {
        current_year++;
        inflation_factor *= 1 + scenario.inflation_assumption.sample();

        if (!spouse?.is_alive) {
          tax_filing_status = TaxFilingStatus.SINGLE;
        }
      },
      // Account and event organization
      accounts: {
        non_retirement,
        pre_tax,
        after_tax,
      },
      events_by_type: {
        income: income_events,
        expense: expense_events,
        invest: investment_events,
        rebalance: rebalance_events,
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
