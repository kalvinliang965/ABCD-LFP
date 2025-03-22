import {
  DistributionType,
  Taxability,
  ChangeType,
  StatisticType,
} from "../../Enums";
import ValueGenerator from "../../../utils/math/ValueGenerator";

/**
 * Represents an investment type in the retirement planning system
 */
export class InvestmentType {
  name: string;
  description?: string;
  returnAmtOrPct: ChangeType;
  returnDistributionType: DistributionType;
  returnDistributionParams: Map<StatisticType, number>;
  expenseRatio: number;
  incomeAmtOrPct: ChangeType;
  incomeDistributionType: DistributionType;
  incomeDistributionParams: Map<StatisticType, number>;
  taxability: Taxability;

  constructor(
    name: string,
    returnAmtOrPct: ChangeType,
    returnDistributionType: DistributionType,
    returnDistributionParams: Map<StatisticType, number>,
    expenseRatio: number,
    incomeAmtOrPct: ChangeType,
    incomeDistributionType: DistributionType,
    incomeDistributionParams: Map<StatisticType, number>,
    taxability: Taxability,
    description?: string
  ) {
    this.name = name;
    this.description = description;
    this.returnAmtOrPct = returnAmtOrPct;
    this.returnDistributionType = returnDistributionType;
    this.returnDistributionParams = returnDistributionParams;
    this.incomeAmtOrPct = incomeAmtOrPct;
    this.incomeDistributionType = incomeDistributionType;
    this.incomeDistributionParams = incomeDistributionParams;

    // Validate expense ratio is non-negative
    if (expenseRatio < 0) {
      throw new Error("Expense ratio cannot be negative");
    }
    this.expenseRatio = expenseRatio;

    this.taxability = taxability;
  }

  /**
   * Generates the expected annual return based on distribution parameters
   * @param baseAmount - The base amount for calculating return (used when returnAmtOrPct is PERCENTAGE)
   * @returns The generated annual return value
   */
  generateExpectedAnnualReturn(baseAmount?: number): number {
    const returnValue = ValueGenerator(
      this.returnDistributionType,
      this.returnDistributionParams
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
   * Generates the expected annual income based on distribution parameters
   * @param baseAmount - The base amount for calculating income (used when incomeAmtOrPct is PERCENTAGE)
   * @returns The generated annual income value
   */
  generateExpectedAnnualIncome(baseAmount?: number): number {
    const incomeValue = ValueGenerator(
      this.incomeDistributionType,
      this.incomeDistributionParams
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
    // Convert string amtOrPct to enum
    const convertAmtOrPct = (value: string): ChangeType => {
      return value === "amount" ? ChangeType.FIXED : ChangeType.PERCENTAGE;
    };

    // Convert boolean taxability to enum
    const taxabilityEnum = data.taxability
      ? Taxability.TAXABLE
      : Taxability.TAX_EXEMPT;

    // Determine return distribution type and create parameter map
    const returnDistType =
      data.returnDistribution.get("type") === "fixed"
        ? DistributionType.FIXED
        : data.returnDistribution.get("type") === "normal"
        ? DistributionType.NORMAL
        : DistributionType.UNIFORM;

    const returnParams = new Map<StatisticType, number>();

    // Add relevant parameters based on distribution type
    switch (returnDistType) {
      case DistributionType.FIXED:
        if (data.returnDistribution.get("value") !== undefined) {
          returnParams.set(
            StatisticType.VALUE,
            data.returnDistribution.get("value")
          );
        }
        break;
      case DistributionType.NORMAL:
        if (data.returnDistribution.get("mean") !== undefined) {
          returnParams.set(
            StatisticType.MEAN,
            data.returnDistribution.get("mean")
          );
        }
        if (data.returnDistribution.get("stdev") !== undefined) {
          returnParams.set(
            StatisticType.STDDEV,
            data.returnDistribution.get("stdev")
          );
        }
        break;
      case DistributionType.UNIFORM:
        if (data.returnDistribution.get("lower") !== undefined) {
          returnParams.set(
            StatisticType.LOWER,
            data.returnDistribution.get("lower")
          );
        }
        if (data.returnDistribution.get("upper") !== undefined) {
          returnParams.set(
            StatisticType.UPPER,
            data.returnDistribution.get("upper")
          );
        }
        break;
    }

    // Determine income distribution type and create parameter map
    const incomeDistType =
      data.incomeDistribution.get("type") === "fixed"
        ? DistributionType.FIXED
        : data.incomeDistribution.get("type") === "normal"
        ? DistributionType.NORMAL
        : DistributionType.UNIFORM;

    const incomeParams = new Map<StatisticType, number>();

    // Add relevant parameters based on distribution type
    switch (incomeDistType) {
      case DistributionType.FIXED:
        if (data.incomeDistribution.get("value") !== undefined) {
          incomeParams.set(
            StatisticType.VALUE,
            data.incomeDistribution.get("value")
          );
        }
        break;
      case DistributionType.NORMAL:
        if (data.incomeDistribution.get("mean") !== undefined) {
          incomeParams.set(
            StatisticType.MEAN,
            data.incomeDistribution.get("mean")
          );
        }
        if (data.incomeDistribution.get("stdev") !== undefined) {
          incomeParams.set(
            StatisticType.STDDEV,
            data.incomeDistribution.get("stdev")
          );
        }
        break;
      case DistributionType.UNIFORM:
        if (data.incomeDistribution.get("lower") !== undefined) {
          incomeParams.set(
            StatisticType.LOWER,
            data.incomeDistribution.get("lower")
          );
        }
        if (data.incomeDistribution.get("upper") !== undefined) {
          incomeParams.set(
            StatisticType.UPPER,
            data.incomeDistribution.get("upper")
          );
        }
        break;
    }

    return new InvestmentType(
      data.name,
      convertAmtOrPct(data.returnAmtOrPct),
      returnDistType,
      returnParams,
      data.expenseRatio,
      convertAmtOrPct(data.incomeAmtOrPct),
      incomeDistType,
      incomeParams,
      taxabilityEnum,
      data.description
    );
  }
}
