import {
  DistributionType,
  ChangeType,
  StatisticType,
} from "../../Enums";
import create_value_generator, {
  ValueGenerator,
} from "../../../utils/math/ValueGenerator";
import { InvestmentTypeRaw } from "../raw/investment_type_raw";
import { Distribution, parse_distribution } from "../raw/common";
import { simulation_logger } from "../../../utils/logger/logger";

export interface InvestmentType {
  name: string;
  description: string;
  return_change_type: ChangeType;
  get_annual_return: () => number;
  expense_ratio: number;
  income_change_type: ChangeType;
  get_annual_income: () => number;
  taxability: boolean;
  resample_annual_values(): void;
  clone(): InvestmentType;
  _expected_annual_return: ValueGenerator,
  _expected_annual_income: ValueGenerator,
}


export function parse_change_type(change_type: string) {
    switch(change_type) {
      case "amount":
        return ChangeType.AMOUNT;
      case "percent":
        return ChangeType.PERCENT;
      default: 
        throw new Error(`Invalid change type ${change_type}`);
    }
}

export function parse_investment_type_distribution(distribution: Distribution): ValueGenerator {
    if (distribution.type != "fixed" && distribution.type != "normal") {
      simulation_logger.error(`Invalid distribution type in investment type ${distribution.type}`)
      throw new Error(`Invalid distribution type in investment type ${distribution.type}`)
    }
    return parse_distribution(distribution);
}

function create_investment_type(raw_data: InvestmentTypeRaw): InvestmentType {
  try {
    const return_change_type = parse_change_type(raw_data.returnAmtOrPct);
    const expected_annual_return = parse_investment_type_distribution(raw_data.returnDistribution);
    const income_change_type = parse_change_type(raw_data.incomeAmtOrPct);
    const expected_annual_income = parse_investment_type_distribution(raw_data.incomeDistribution);
    const taxability = raw_data.taxability;
    
    // annual income should always be positive...
    let [annual_return, annual_income] = [expected_annual_return.sample(), Math.abs(expected_annual_income.sample())];
    return {
      name: raw_data.name,
      description: raw_data.description,
      return_change_type,
      get_annual_return: () => annual_return,
      income_change_type,
      get_annual_income: () => annual_income,
      taxability,
      expense_ratio: raw_data.expenseRatio,
      resample_annual_values: () => {
        [annual_return, annual_income] = [expected_annual_return.sample(), Math.abs(expected_annual_income.sample())];
      },
      clone: () => create_investment_type(raw_data),
      _expected_annual_income: expected_annual_income, // should not be use. ONLY for testing
      _expected_annual_return: expected_annual_return,
    }
  } catch(error) {
    throw new Error(`Failed to initialize InvestmentType: ${error instanceof Error? error.message: error}`);
  }
}


export { create_investment_type };