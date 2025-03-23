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
  setup_year(): void;
  get_current_year(): number;
  get_financial_goal(): number;
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
  get_active_events(): Event[];
  process_tax(): void;
  cash: Investment;
}

// Helper Functions

// Check if an event is active in the current year
function is_event_active(event: Event, current_year: number): boolean {
  return (
    current_year >= event.start && current_year < event.start + event.duration
  );
}

// Calculate the current amount for an event based on its initial amount, changes, and inflation
function calculate_event_amount(
  event: any,
  initial_amount: number,
  years_active: number,
  inflation_factor: number
): number {
  let amount = initial_amount;

  // Apply annual changes for each year the event has been active
  for (let i = 0; i < years_active; i++) {
    if (event.change_type === ChangeType.FIXED) {
      amount += event.expected_annual_change;
    } else if (event.change_type === ChangeType.PERCENTAGE) {
      amount *= 1 + event.expected_annual_change;
    }
  }

  // Apply inflation adjustment if needed
  if (event.inflation_adjusted) {
    amount *= inflation_factor;
  }

  return amount;
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

  return [cash_account, non_retirement_account, pre_tax_account, after_tax_account];
}

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
    const is_married = scenario.tax_filing_status === TaxFilingStatus.MARRIED;
    let tax_filing_status = scenario.tax_filing_status;

    // Income tracking variables
    let ordinary_income = 0;
    let capital_gains_income = 0;
    let social_security_income = 0;
    let after_tax_contribution = 0; // contribution to after tax account.

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
      roth_conversion_strategy: scenario.roth_conversion_strategy,
      user,
      spouse,

      // Income getters and setters
      get_tax_filing_status: () => tax_filing_status,
      get_financial_goal: () => scenario.financialGoal,
      get_ordinary_income: () => ordinary_income,
      get_capital_gains_income: () => capital_gains_income,
      get_social_security_income: () => social_security_income,
      get_after_tax_contribution: () => after_tax_contribution,
      get_after_tax_contribution_limit: () =>
        scenario.after_tax_contribution_limit,
      incr_ordinary_income: (amt: number) => {
        ordinary_income += amt;
      },
      incr_capital_gains_income: (amt: number) => {
        capital_gains_income += amt;
      },
      incr_social_security_income: (amt: number) => {
        social_security_income += amt;
      },
      incr_after_tax_contribution: (amt: number) => {
        after_tax_contribution += amt;
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

      // Event processing methods
      get_active_events: function () {
        return this.events.filter((e) =>
          is_event_active(e, this.get_current_year())
        );
      },

      process_events: function () {
        const year = this.get_current_year();

        // Process income events
        for (const [_, event] of this.events_by_type.income) {
          if (is_event_active(event, year)) {
            const years_active = year - event.start;
            const amount = calculate_event_amount(
              event,
              (event as any).initial_amount,
              years_active,
              this.inflation_factor
            );

            if ((event as any).social_security) {
              this.incr_social_security_income(amount);
            } else {
              this.incr_ordinary_income(amount);
            }
          }
        }

        // TODO: Process expense events
        // TODO: Process investment events
        // TODO: Process rebalance events
      },

      process_tax: () => {
            try {
                const standard_deduction = federal_tax_service.find_deduction(tax_filing_status);
                const taxable_income = ((ordinary_income + capital_gains_income) - 0.15 * social_security_income) - standard_deduction;
                const federal_taxable_income_tax = taxable_income * federal_tax_service.find_rate(
                    taxable_income, 
                    IncomeType.TAXABLE_INCOME, 
                    tax_filing_status
                );
                const state_taxable_income_tax = taxable_income * state_tax_service.find_rate(
                    taxable_income,
                    tax_filing_status,
                );
                const federal_capital_gains_tax =  capital_gains_income * federal_tax_service.find_rate(
                    capital_gains_income, 
                    IncomeType.CAPITAL_GAINS, 
                    tax_filing_status
                );
                cash.incr_value(taxable_income - federal_capital_gains_tax - federal_taxable_income_tax - state_taxable_income_tax);
            } catch (error) {
                throw new Error(`Failed to process tax ${error instanceof Error? error.message : error}`);
            }
      },

      // Year setup and management
      setup_year: () => {
        ordinary_income = 0;
        capital_gains_income = 0;
        social_security_income = 0;
        after_tax_contribution = 0
        federal_tax_service.adjust_for_inflation(inflation_factor);
        state_tax_service.adjust_for_inflation(inflation_factor);
        
        // type check
        for (const [id, investment] of non_retirement.entries()) {
            if (investment.taxStatus != TaxStatus.NON_RETIREMENT) {
                console.error(`non retirment account contain invalid type ${investment.taxStatus}`);
                process.exit(1);
            }
        }
        for (const [id, investment] of after_tax.entries()) {
            if (investment.taxStatus != TaxStatus.AFTER_TAX) {
                console.error(`after tax account contain invalid type ${investment.taxStatus}`);
                process.exit(1);
            }
        }
        for (const [id, investment] of pre_tax.entries()) {
            if (investment.taxStatus != TaxStatus.PRE_TAX) {
                console.error(`pre tax account contain invalid type ${investment.taxStatus}`);
                process.exit(1);
            }
        }
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
