import {
  DistributionType,
  Taxability,
  ChangeType,
  StatisticType,
} from "../../Enums";
import ValueGenerator from "../../../utils/math/ValueGenerator";

/**
 * Represents a distribution with a specific type and associated values
 */
export interface Distribution {
  type: DistributionType;
  value?: number;
  mean?: number;
  stdev?: number;
  lower?: number;
  upper?: number;
}

/**
 * Represents an investment type in the retirement planning system
 */
export class InvestmentType {
  name: string;
  description?: string;
  returnAmtOrPct: ChangeType;
  returnDistribution: Distribution;
  expenseRatio: number;
  incomeAmtOrPct: ChangeType;
  incomeDistribution: Distribution;
  taxability: Taxability;

  constructor(
    name: string,
    returnAmtOrPct: ChangeType,
    returnDistribution: Distribution,
    expenseRatio: number,
    incomeAmtOrPct: ChangeType,
    incomeDistribution: Distribution,
    taxability: Taxability,
    description?: string
  ) {
    this.name = name;
    this.description = description;
    this.returnAmtOrPct = returnAmtOrPct;
    this.returnDistribution = returnDistribution;
    this.incomeAmtOrPct = incomeAmtOrPct;
    this.incomeDistribution = incomeDistribution;

    // Validate expense ratio is non-negative
    if (expenseRatio < 0) {
      throw new Error("Expense ratio cannot be negative");
    }
    this.expenseRatio = expenseRatio;

    this.taxability = taxability;
  }

  /**
   * Generates the expected annual return based on the returnDistribution
   * @param baseAmount - The base amount for calculating return (used when returnAmtOrPct is 'percent')
   * @returns The generated annual return value
   */
  generateExpectedAnnualReturn(baseAmount?: number): number {
    const params = new Map<StatisticType, number>();

    switch (this.returnDistribution.type) {
      case DistributionType.FIXED:
        params.set(StatisticType.VALUE, this.returnDistribution.value || 0);
        break;
      case DistributionType.NORMAL:
        params.set(StatisticType.MEAN, this.returnDistribution.mean || 0);
        params.set(StatisticType.STDDEV, this.returnDistribution.stdev || 0);
        break;
      case DistributionType.UNIFORM:
        params.set(StatisticType.LOWER, this.returnDistribution.lower || 0);
        params.set(StatisticType.UPPER, this.returnDistribution.upper || 0);
        break;
    }

    const returnValue = ValueGenerator(
      this.returnDistribution.type,
      params
    ).sample();

    // If return is specified as percentage and baseAmount is provided, calculate the actual amount
    if (
      this.returnAmtOrPct === ChangeType.PERCENTAGE &&
      baseAmount !== undefined
    ) {
      return returnValue * baseAmount;
    }

    return returnValue;
  }

  /**
   * Generates the expected annual income based on the incomeDistribution
   * @param baseAmount - The base amount for calculating income (used when incomeAmtOrPct is 'percent')
   * @returns The generated annual income value
   */
  generateExpectedAnnualIncome(baseAmount?: number): number {
    const params = new Map<StatisticType, number>();

    switch (this.incomeDistribution.type) {
      case DistributionType.FIXED:
        params.set(StatisticType.VALUE, this.incomeDistribution.value || 0);
        break;
      case DistributionType.NORMAL:
        params.set(StatisticType.MEAN, this.incomeDistribution.mean || 0);
        params.set(StatisticType.STDDEV, this.incomeDistribution.stdev || 0);
        break;
      case DistributionType.UNIFORM:
        params.set(StatisticType.LOWER, this.incomeDistribution.lower || 0);
        params.set(StatisticType.UPPER, this.incomeDistribution.upper || 0);
        break;
    }

    const incomeValue = ValueGenerator(
      this.incomeDistribution.type,
      params
    ).sample();

    // If income is specified as percentage and baseAmount is provided, calculate the actual amount
    if (
      this.incomeAmtOrPct === ChangeType.PERCENTAGE &&
      baseAmount !== undefined
    ) {
      return incomeValue * baseAmount;
    }

    return incomeValue;
  }

  /**
   * Creates an InvestmentType instance from raw data
   */
  static fromData(data: any): InvestmentType {
    // Convert distribution from Map to our Distribution interface
    const convertDistribution = (distData: Map<string, any>): Distribution => {
      const result: Distribution = {
        type:
          distData.get("type") === "fixed"
            ? DistributionType.FIXED
            : distData.get("type") === "normal"
            ? DistributionType.NORMAL
            : DistributionType.UNIFORM,
      };

      if (distData.get("value") !== undefined) {
        result.value = distData.get("value");
      }
      if (distData.get("mean") !== undefined) {
        result.mean = distData.get("mean");
      }
      if (distData.get("stdev") !== undefined) {
        result.stdev = distData.get("stdev");
      }
      if (distData.get("lower") !== undefined) {
        result.lower = distData.get("lower");
      }
      if (distData.get("upper") !== undefined) {
        result.upper = distData.get("upper");
      }

      return result;
    };

    // Convert string amtOrPct to enum
    const convertAmtOrPct = (value: string): ChangeType => {
      return value === "amount" ? ChangeType.FIXED : ChangeType.PERCENTAGE;
    };

    // Convert boolean taxability to enum
    const taxabilityEnum = data.taxability
      ? Taxability.TAXABLE
      : Taxability.TAX_EXEMPT;

    return new InvestmentType(
      data.name,
      convertAmtOrPct(data.returnAmtOrPct),
      convertDistribution(data.returnDistribution),
      data.expenseRatio,
      convertAmtOrPct(data.incomeAmtOrPct),
      convertDistribution(data.incomeDistribution),
      taxabilityEnum,
      data.description
    );
  }
}
