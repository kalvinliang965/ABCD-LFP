// src/core/domain/Scenario.ts
// we will use this function to read data read from front end and call other function to parse the data
import ValueGenerator, {
  RandomGenerator,
} from "../../../utils/math/ValueGenerator";
import {
  DistributionType,
  StateType,
  StatisticType,
  TaxFilingStatus,
} from "../../Enums";
import { create_investment, Investment } from "../investment/Investment";
import { Event, process_event_dependencies } from "../event/Event";
import create_income_event from "../event/IncomeEvent";
import create_expense_event from "../event/ExpenseEvent";
import create_investment_event from "../event/InvestmentEvent";
import create_rebalance_event from "../event/RebalanceEvent";
import { SpendingEvent } from "../../simulation/ExpenseHelper";

function parse_state(state: string) {
  switch (state) {
    case "NY":
      return StateType.NY;
    case "CT":
      return StateType.CT;
    case "NJ":
      return StateType.NJ;
    default:
      throw new Error("Invalid state");
  }
}

function parse_martial_status(status: string) {
  switch (status) {
    case "individual":
      return TaxFilingStatus.SINGLE;
    case "couple":
      return TaxFilingStatus.MARRIED;
    default:
      throw new Error("Invalid martial status");
  }
}

function parse_birth_years(birthYears: Array<number>): Array<number> {
  if (birthYears.length > 2 || birthYears.length == 0) {
    throw new Error(`Invalid number of birth year ${birthYears}`);
  }
  const user_birth_year = birthYears[0];
  // -1 to indicate no spouse
  const spouse_birth_year = birthYears.length >= 2 ? birthYears[1] : -1;
  return [user_birth_year, spouse_birth_year];
}

function parse_life_expectancy(
  lifeExpectancy: Array<Map<string, any>>
): Array<number> {
  if (lifeExpectancy.length > 2 || lifeExpectancy.length == 0) {
    throw new Error(`Invalid number of lifeExpectancy ${lifeExpectancy}`);
  }

  const parse = (params: Map<string, any>): number => {
    if (!params.has("type")) {
      throw new Error(`Life expectancy dont have type field ${params}`);
    }

    switch (params.get("type")) {
      case "fixed":
        const value = params.get("value");
        if (!value) {
          throw new Error(
            `life expectancy value field does not exist for fixed type: ${params}`
          );
        }
        return ValueGenerator(
          DistributionType.FIXED,
          new Map([[StatisticType.VALUE, value]])
        ).sample();
      case "normal":
        const mean = params.get("mean");
        if (!mean) {
          throw new Error(
            `life expectancy mean field does not exist for normal type: ${params}`
          );
        }
        const stdev = params.get("stdev");
        if (!stdev) {
          throw new Error(
            `life expectancy stdev field does not exist for normal type: ${params}`
          );
        }
        return ValueGenerator(
          DistributionType.NORMAL,
          new Map([
            [StatisticType.MEAN, mean],
            [StatisticType.STDEV, stdev],
          ])
        ).sample();
      default:
        throw new Error(
          `Invalid type for calculating life expectancy ${params}`
        );
    }
  };
  try {
    const user_life_expectancy = parse(lifeExpectancy[0]);
    const spouse_life_expectancy =
      lifeExpectancy.length == 2 ? parse(lifeExpectancy[1]) : -1;
    return [user_life_expectancy, spouse_life_expectancy];
  } catch (error) {
    throw error;
  }
}

function parse_inflation_assumption(
  inflationAssumption: Map<string, any>
): RandomGenerator {
  try {
    switch (inflationAssumption.get("type")) {
      case "fixed":
        return ValueGenerator(
          DistributionType.FIXED,
          new Map([[StatisticType.VALUE, inflationAssumption.get("value")]])
        );
      case "normal":
        return ValueGenerator(
          DistributionType.NORMAL,
          new Map([
            [StatisticType.MEAN, inflationAssumption.get("mean")],
            [StatisticType.STDEV, inflationAssumption.get("stdev")],
          ])
        );
      case "uniform":
        return ValueGenerator(
          DistributionType.UNIFORM,
          new Map([
            [StatisticType.LOWER, inflationAssumption.get("lower")],
            [StatisticType.UPPER, inflationAssumption.get("upper")],
          ])
        );
      default:
        throw new Error(
          `inflation assumption type is invalid ${inflationAssumption}`
        );
    }
  } catch (error) {
    throw new Error(
      `Failed to parse inflation assumption ${inflationAssumption}`
    );
  }
}

// ! Chen made this function to parse events
function parse_events(
  eventSeries: Set<
    IncomeEventRaw | ExpenseEventRaw | InvestmentEventRaw | RebalanceEventRaw
  >
): Event[] {
  let events: Event[] = [];

  if (eventSeries && eventSeries.size > 0) {
    const rawEvents = Array.from(eventSeries);

    // Process dependencies to resolve start years that depend on other events
    process_event_dependencies(rawEvents);

    // Process each type of event
    events = rawEvents.map((rawEvent) => {
      switch (rawEvent.type) {
        case "income":
          return create_income_event(rawEvent as IncomeEventRaw);
        case "expense":
          return create_expense_event(rawEvent as ExpenseEventRaw);
        case "investment":
          return create_investment_event(rawEvent as InvestmentEventRaw);
        case "rebalance":
          return create_rebalance_event(rawEvent as RebalanceEventRaw);
        default:
          throw new Error(`Unknown event type: ${rawEvent.type}`);
      }
    });
  }

  return events;
}

export type InvestmentRaw = {
  investmentType: InvestmentTypeRaw;
  value: number;
  taxStatus: string; // "non-retirement", "pre-tax", "after-tax"
  id: string;
};

export type InvestmentTypeRaw = {
  name: string;
  description: string;
  returnAmtOrPct: string; // amount or percent
  returnDistribution: Map<string, any>;
  expenseRatio: number;
  incomeAmtOrPct: string;
  incomeDistribution: Map<string, any>;
  taxability: boolean;
};

export type EventRaw = {
  name: string;
  start: Map<string, any>;
  duration: Map<string, any>;
  type: string;
};

export type IncomeEventRaw = EventRaw & {
  initialAmount: number;
  changeAmtOrPct: string;
  changeDistribution: Map<string, any>;
  inflationAdjusted: boolean;
  userFraction: number;
  socialSecurity: boolean;
};

export type ExpenseEventRaw = EventRaw & {
  initialAmount: number;
  changeAmtOrPct: string;
  changeDistribution: Map<string, any>;
  inflationAdjusted: boolean;
  userFraction: number;
  discretionary: boolean;
};

export type InvestmentEventRaw = EventRaw & {
  assetAllocation: Map<string, number>;
  assetAllocation2: Map<string, number>;
  glidePath: boolean;
  maxCash: number;
};

export type RebalanceEventRaw = EventRaw & {
  assetAllocation: Map<string, number>;
};

export interface ScenarioRaw {
  name: string;
  martialStatus: string;
  birthYears: Array<number>;
  lifeExpectancy: Array<Map<string, any>>;
  investments: Set<InvestmentRaw>;
  eventSeries: Set<
    IncomeEventRaw | ExpenseEventRaw | InvestmentEventRaw | RebalanceEventRaw
  >;
  inflationAssumption: Map<string, number>;
  afterTaxContributionLimit: number;
  spendingStrategy: Array<string>;
  expenseWithdrawalStrategy: Array<string>;
  RMDStrategy: Array<string>;
  RothConversionOpt: boolean;
  RothConversionStart: number;
  RothConversionEnd: number;
  RothConversionStrategy: Array<string>;
  financialGoal: number;
  residenceState: string;
}

export interface Scenario {
  name: string;
  tax_filing_status: TaxFilingStatus;
  user_birth_year: number;
  spouse_birth_year?: number;
  user_life_expectancy: number;
  spouse_life_expectancy?: number;
  investments: Array<Investment>;
  event_series: any;
  discretionary_expenses: SpendingEvent[];
  mandatory_expenses: SpendingEvent[];
  get_discretionary_expenses(): SpendingEvent[];
  get_mandatory_expenses(): SpendingEvent[];
  inflation_assumption: RandomGenerator;
  after_tax_contribution_limit: number;
  spending_strategy: Array<string>;
  expense_withrawal_strategy: Array<string>;
  rmd_strategy: Array<string>;
  roth_conversion_opt: boolean;
  roth_conversion_start: number;
  roth_conversion_end: number;
  roth_conversion_strategy: Array<string>;
  financialGoal: number;
  residenceState: StateType;
}

export function create_scenario(scenario_raw: ScenarioRaw): Scenario {
  try {
    const taxfilingStatus: TaxFilingStatus = parse_martial_status(
      scenario_raw.martialStatus
    );
    const [user_birth_year, spouse_birth_year] = parse_birth_years(
      scenario_raw.birthYears
    );
    const [user_life_expectancy, spouse_life_expectancy] =
      parse_life_expectancy(scenario_raw.lifeExpectancy);
    const investments: Array<Investment> = Array.from(scenario_raw.investments).map(
      (investment: InvestmentRaw): Investment => create_investment(investment)
    );

    //! Change chen made for parsing events  Use the extracted function to parse events
    const events = parse_events(scenario_raw.eventSeries);

    const inflation_assumption: RandomGenerator = parse_inflation_assumption(
      scenario_raw.inflationAssumption
    );
    const after_tax_contribution_limit: number =
      scenario_raw.afterTaxContributionLimit;
    const spending_strategy: Array<string> = scenario_raw.spendingStrategy;
    const expense_withrawal_strategy: Array<string> =
      scenario_raw.expenseWithdrawalStrategy;
    const rmd_strategy: Array<string> = scenario_raw.RMDStrategy;
    const roth_conversion_opt: boolean = scenario_raw.RothConversionOpt;
    const roth_conversion_start: number = scenario_raw.RothConversionStart;
    const roth_conversion_end: number = scenario_raw.RothConversionEnd;
    const roth_conversion_strategy: Array<string> =
      scenario_raw.RothConversionStrategy;
    const financialGoal: number = scenario_raw.financialGoal;
    const residenceState: StateType = parse_state(scenario_raw.residenceState);
    return {
      name: scenario_raw.name,
      tax_filing_status: taxfilingStatus,
      user_birth_year,
      spouse_birth_year,
      user_life_expectancy,
      spouse_life_expectancy,
      investments,
      event_series: events,
      discretionary_expenses: [],
      mandatory_expenses: [],
      //? 在使用get 方法后是不是代表这我们无法修改其中的值？
      get_discretionary_expenses: function () {
        return this.discretionary_expenses;
      },
      get_mandatory_expenses: function () {
        return this.mandatory_expenses;
      },
      inflation_assumption,
      after_tax_contribution_limit,
      spending_strategy,
      expense_withrawal_strategy,
      rmd_strategy,
      roth_conversion_opt,
      roth_conversion_start,
      roth_conversion_end,
      roth_conversion_strategy,
      financialGoal,
      residenceState,
    };
  } catch (error) {
    throw new Error(
      `An error occured while creating Scenario instance: ${error}`
    );
  }
}
