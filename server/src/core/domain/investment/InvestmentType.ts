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
  returnValue?: number;
  returnMean?: number;
  returnStdev?: number;
  returnLower?: number;
  returnUpper?: number;
  expenseRatio: number;
  incomeAmtOrPct: ChangeType;
  incomeDistributionType: DistributionType;
  incomeValue?: number;
  incomeMean?: number;
  incomeStdev?: number;
  incomeLower?: number;
  incomeUpper?: number;
  taxability: Taxability;

  constructor(
    name: string,
    returnAmtOrPct: ChangeType,
    returnDistributionType: DistributionType,
    expenseRatio: number,
    incomeAmtOrPct: ChangeType,
    incomeDistributionType: DistributionType,
    taxability: Taxability,
    description?: string,
    returnValue?: number,
    returnMean?: number,
    returnStdev?: number,
    returnLower?: number,
    returnUpper?: number,
    incomeValue?: number,
    incomeMean?: number,
    incomeStdev?: number,
    incomeLower?: number,
    incomeUpper?: number
  ) {
    this.name = name;
    this.description = description;
    this.returnAmtOrPct = returnAmtOrPct;
    this.returnDistributionType = returnDistributionType;
    this.returnValue = returnValue;
    this.returnMean = returnMean;
    this.returnStdev = returnStdev;
    this.returnLower = returnLower;
    this.returnUpper = returnUpper;
    this.incomeAmtOrPct = incomeAmtOrPct;
    this.incomeDistributionType = incomeDistributionType;
    this.incomeValue = incomeValue;
    this.incomeMean = incomeMean;
    this.incomeStdev = incomeStdev;
    this.incomeLower = incomeLower;
    this.incomeUpper = incomeUpper;

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
    const params = new Map<StatisticType, number>();

    switch (this.returnDistributionType) {
      case DistributionType.FIXED:
        params.set(StatisticType.VALUE, this.returnValue || 0);
        break;
      case DistributionType.NORMAL:
        params.set(StatisticType.MEAN, this.returnMean || 0);
        params.set(StatisticType.STDDEV, this.returnStdev || 0);
        break;
      case DistributionType.UNIFORM:
        params.set(StatisticType.LOWER, this.returnLower || 0);
        params.set(StatisticType.UPPER, this.returnUpper || 0);
        break;
    }

    const returnValue = ValueGenerator(
      this.returnDistributionType,
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
   * Generates the expected annual income based on distribution parameters
   * @param baseAmount - The base amount for calculating income (used when incomeAmtOrPct is PERCENTAGE)
   * @returns The generated annual income value
   */
  generateExpectedAnnualIncome(baseAmount?: number): number {
    const params = new Map<StatisticType, number>();

    switch (this.incomeDistributionType) {
      case DistributionType.FIXED:
        params.set(StatisticType.VALUE, this.incomeValue || 0);
        break;
      case DistributionType.NORMAL:
        params.set(StatisticType.MEAN, this.incomeMean || 0);
        params.set(StatisticType.STDDEV, this.incomeStdev || 0);
        break;
      case DistributionType.UNIFORM:
        params.set(StatisticType.LOWER, this.incomeLower || 0);
        params.set(StatisticType.UPPER, this.incomeUpper || 0);
        break;
    }

    const incomeValue = ValueGenerator(
      this.incomeDistributionType,
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
    // Convert string amtOrPct to enum
    const convertAmtOrPct = (value: string): ChangeType => {
      return value === "amount" ? ChangeType.FIXED : ChangeType.PERCENTAGE;
    };

    // Convert boolean taxability to enum
    const taxabilityEnum = data.taxability
      ? Taxability.TAXABLE
      : Taxability.TAX_EXEMPT;

    // Determine distribution type and parameters
    const returnDistType =
      data.returnDistribution.get("type") === "fixed"
        ? DistributionType.FIXED
        : data.returnDistribution.get("type") === "normal"
        ? DistributionType.NORMAL
        : DistributionType.UNIFORM;

    const incomeDistType =
      data.incomeDistribution.get("type") === "fixed"
        ? DistributionType.FIXED
        : data.incomeDistribution.get("type") === "normal"
        ? DistributionType.NORMAL
        : DistributionType.UNIFORM;

    return new InvestmentType(
      data.name,
      convertAmtOrPct(data.returnAmtOrPct),
      returnDistType,
      data.expenseRatio,
      convertAmtOrPct(data.incomeAmtOrPct),
      incomeDistType,
      taxabilityEnum,
      data.description,
      data.returnDistribution.get("value"),
      data.returnDistribution.get("mean"),
      data.returnDistribution.get("stdev"),
      data.returnDistribution.get("lower"),
      data.returnDistribution.get("upper"),
      data.incomeDistribution.get("value"),
      data.incomeDistribution.get("mean"),
      data.incomeDistribution.get("stdev"),
      data.incomeDistribution.get("lower"),
      data.incomeDistribution.get("upper")
    );
  }
}
