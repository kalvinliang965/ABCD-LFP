import { InvestmentRaw } from "./investment_raw";
import { IncomeEventRaw } from "./event_raw/income_event_raw";
import { ExpenseEventRaw } from "./event_raw/expense_event_raw";
import { InvestEventRaw } from "./event_raw/investment_event_raw";
import { RebalanceEventRaw } from "./event_raw/rebalance_event_raw";
import {
  cash_investment_one,
  s_and_p_500_investment_non_retirement_one,
  s_and_p_500_investment_after_tax_one,
  s_and_p_500_investment_pre_tax_one,
  tax_exempt_bonds_investment_one,
} from "./investment_raw";

import {
  streaming_services_expense_one,
  food_expense_one,
  vacation_expense_one,
} from "./event_raw/expense_event_raw";

import { my_investments_investment_one } from "./event_raw/investment_event_raw";
import { rebalance_one } from "./event_raw/rebalance_event_raw";
import { salary_income_event_one } from "./event_raw/income_event_raw";
import { cash_investment_type_one, InvestmentTypeRaw, s_and_p_500_investment_type_one, tax_exempt_bonds_investment_type_one } from "./investment_type_raw";
import { Distribution } from "./common";
import { simulation_logger } from "../../../utils/logger/logger";

// a distribution is represented as a map with one of the following forms:
// {type: fixed, value: <number>}
// {type: normal, mean: <number>, stdev: <number>}
// {type: uniform, lower: <number>, upper: <number>}
// percentages are represented by their decimal value, e.g., 4% is represented as 0.04.

export interface ScenarioRaw {
  name: string;
  maritalStatus: 'couple' | 'individual';
  birthYears: Array<number>;
  lifeExpectancy: Array<Distribution>;
  investmentTypes: Set<InvestmentTypeRaw>
  investments: Set<InvestmentRaw>;
  eventSeries: Set<
    IncomeEventRaw | ExpenseEventRaw | InvestEventRaw | RebalanceEventRaw
  >;
  inflationAssumption: Distribution;
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

export const scenario_one = create_scenario_raw(
  "Retirement Planning Scenario",
  "couple", // couple or individual
  [1985, 1987], // a list with length 1 or 2, depending on maritalStatus. if len=2, the first entry is for the user; second entry, for the spouse.
  [
    {
      type: "fixed",
      value: 80,
    },
    { 
      type: "normal",
      mean: 82,
      stdev: 3,
    },
  ], // a list with length 1 or 2, depending on maritalStatus.
  new Set<InvestmentTypeRaw>([
    cash_investment_type_one,
    s_and_p_500_investment_type_one,
    tax_exempt_bonds_investment_type_one,
  ]),
  // investment id is a unique identifier.  without it, we would need to use a pair (investment type, tax status) to identify an investment.
  new Set<InvestmentRaw>([
    cash_investment_one,
    s_and_p_500_investment_non_retirement_one,
    tax_exempt_bonds_investment_one,
    s_and_p_500_investment_pre_tax_one,
    s_and_p_500_investment_after_tax_one,
  ]),

  new Set<
    IncomeEventRaw | InvestEventRaw | ExpenseEventRaw | RebalanceEventRaw
  >([
    salary_income_event_one,
    food_expense_one,
    vacation_expense_one,
    streaming_services_expense_one,
    my_investments_investment_one,
    rebalance_one,
  ]),
  {
    type: "fixed",
    value: 0.03,
  },
  7000,
  ["vacation", "streaming services"],
  ["S&P 500 non-retirement", "tax-exempt bonds", "S&P 500 after-tax"], // list of investments, identified by id
  ["S&P 500 pre-tax"], // list of pre-tax investments, identified by id
  true, // boolean indicating whether the Roth Conversion optimizer is enabled
  2050, // start year
  2060, // end year
  ["S&P 500 pre-tax"], // list of pre-tax investments, identified by id
  10000,
  "NY" // states are identified by standard 2-letter abbreviations
);

export function create_scenario_raw(
  name: string,
  maritalStatus: 'couple' | 'individual',
  birthYears: Array<number>,
  lifeExpectancy: Array<Distribution>,
  investmentTypes: Set<InvestmentTypeRaw>,
  investments: Set<InvestmentRaw>,
  eventSeries: Set<
    IncomeEventRaw | InvestEventRaw | ExpenseEventRaw | RebalanceEventRaw
  > = new Set(),
  inflationAssumption: Distribution = { type: "fixed", value: 0},
  afterTaxContributionLimit: number = 0,
  spendingStrategy: Array<string> = new Array(),
  expenseWithdrawalStrategy: Array<string> = new Array(),
  RMDStrategy: Array<string> = Array(),
  RothConversionOpt: boolean = false,
  RothConversionStart: number = -1,
  RothConversionEnd: number = -1,
  RothConversionStrategy: Array<string> = new Array(),
  financialGoal: number,
  residenceState: string
): ScenarioRaw {
  
  // Validate Roth conversion parameters if opted in
  if (RothConversionOpt) {
    if (RothConversionStart == null || RothConversionEnd == null) {
      simulation_logger.error("Opt-in for Roth conversion but start/end year isn't provided");
      throw new Error("Opt-in for Roth conversion but start/end year isn't provided");
    }
    if (RothConversionStart > RothConversionEnd) {
      simulation_logger.error("Roth conversion start after end year");
      throw new Error("Roth conversion start after end year");
    }
  }
  
  return {
    name,
    maritalStatus,
    birthYears,
    lifeExpectancy,
    investmentTypes,
    investments,
    eventSeries,
    inflationAssumption,
    afterTaxContributionLimit,
    spendingStrategy,
    expenseWithdrawalStrategy,
    RMDStrategy,
    RothConversionOpt,
    RothConversionStart,
    RothConversionEnd,
    RothConversionStrategy,
    financialGoal,
    residenceState,
  };
}
