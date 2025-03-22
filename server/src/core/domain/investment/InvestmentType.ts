import {
  DistributionType,
  Taxability,
  ChangeType,
  StatisticType,
} from "../../Enums";
import ValueGenerator, {
  RandomGenerator,
} from "../../../utils/math/ValueGenerator";
import { InvestmentTypeRaw } from "../scenario/Scenario";

export interface InvestmentType {
  name: string;
  description: string;
  return_change_type: ChangeType;
  expect_annual_return: RandomGenerator;
  expense_ratio: number;
  income_change_type: ChangeType;
  expect_annual_income: RandomGenerator;
  taxability: Taxability;
}


function parse_change_type(change_type: string) {
    switch(change_type) {
      case "amount":
        return ChangeType.FIXED;
      case "percent":
        return ChangeType.PERCENTAGE;
      default: 
        throw new Error(`Invalid change type ${change_type}`);
    }
}

function parse_distribution(distribution: Map<string, any>): RandomGenerator {
    switch (distribution.get("type")) {
        case "fixed":
            return ValueGenerator(DistributionType.FIXED,  new Map([
                [StatisticType.VALUE, distribution.get("value")]
            ]));
        case "normal":
            return ValueGenerator(DistributionType.UNIFORM, new Map([
                [StatisticType.MEAN, distribution.get("mean")],
                [StatisticType.STDDEV, distribution.get("stdev")]
            ]));
        default:
            throw new Error(`Invalid change distribution type ${distribution}`);            
    }
}

function parse_taxability(taxability: boolean) {
  if (taxability) {
    return Taxability.TAXABLE;
  }
  return Taxability.TAX_EXEMPT;
}

function create_investmentType(raw_data: InvestmentTypeRaw): InvestmentType {
  try {
    const return_change_type = parse_change_type(raw_data.returnAmtOrPct);
    const expect_annual_return = parse_distribution(raw_data.returnDistribution);
    const income_change_type = parse_change_type(raw_data.incomeAmtOrPct);
    const expect_annual_income = parse_distribution(raw_data.incomeDistribution);
    const taxability = parse_taxability(raw_data.taxability);
    return {
      name: raw_data.name,
      description: raw_data.description,
      return_change_type,
      expect_annual_return,
      income_change_type,
      expect_annual_income,
      taxability,
      expense_ratio: raw_data.expenseRatio,
    }
  } catch(error) {
    throw new Error(`Failed to initialize InvestmentType ${error}`);
  }
}

export { create_investmentType };