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

export interface InvestmentTypePublicInfo {
  name: string;
  description: string;
  expectAnnualReturn: number;
  expenseRatio: number;
  expectAnnualIncome: number;
  taxability: Taxability;
}

/**
 * dealing with the raw data from Scenario, and providing calculation functions
 */
export class InvestmentType {
  name: string;
  description: string;
  private _returnAmtOrPct: ChangeType;
  private _returnDistributionType: DistributionType;
  private _returnDistributionParams: Map<StatisticType, number>;
  expenseRatio: number;
  private _incomeAmtOrPct: ChangeType;
  private _incomeDistributionType: DistributionType;
  private _incomeDistributionParams: Map<StatisticType, number>;
  taxability: Taxability;

  /**
   * parse the distribution type and parameters
   * @param distributionData the Map contains the distribution information
   * @returns the object contains the distribution type and parameters
   */
  private static parseDistribution(distributionData: Map<string, any>): {
    type: DistributionType;
    params: Map<StatisticType, number>;
  } {
    // parse the distribution type
    const distType =
      distributionData.get("type") === "fixed"
        ? DistributionType.FIXED
        : distributionData.get("type") === "normal"
        ? DistributionType.NORMAL
        : DistributionType.UNIFORM;

    // create the parameter Map
    const params = new Map<StatisticType, number>();

    // add the related parameters based on the distribution type
    switch (distType) {
      case DistributionType.FIXED:
        if (distributionData.get("value") !== undefined) {
          params.set(StatisticType.VALUE, distributionData.get("value"));
        }
        break;
      case DistributionType.NORMAL:
        if (distributionData.get("mean") !== undefined) {
          params.set(StatisticType.MEAN, distributionData.get("mean"));
        }
        if (distributionData.get("stdev") !== undefined) {
          params.set(StatisticType.STDDEV, distributionData.get("stdev"));
        }
        break;
      case DistributionType.UNIFORM:
        if (distributionData.get("lower") !== undefined) {
          params.set(StatisticType.LOWER, distributionData.get("lower"));
        }
        if (distributionData.get("upper") !== undefined) {
          params.set(StatisticType.UPPER, distributionData.get("upper"));
        }
        break;
    }

    return { type: distType, params };
  }

  /**
   * convert the string to ChangeType enum
   */
  private static convertAmtOrPct(value: string): ChangeType {
    return value === "amount" ? ChangeType.FIXED : ChangeType.PERCENTAGE;
  }

  /**
   * constructor - accept the InvestmentTypeRaw data from Scenario
   */
  constructor(data: InvestmentTypeRaw) {
    // set the basic properties
    this.name = data.name;
    this.description = data.description;

    // validate the expense ratio is non-negative
    if (data.expenseRatio < 0) {
      throw new Error("Expense ratio cannot be negative");
    }
    this.expenseRatio = data.expenseRatio;

    // convert the string to ChangeType enum
    this._returnAmtOrPct = InvestmentType.convertAmtOrPct(data.returnAmtOrPct);

    // parse the distribution type and parameters
    const returnDist = InvestmentType.parseDistribution(
      data.returnDistribution
    );
    this._returnDistributionType = returnDist.type;
    this._returnDistributionParams = returnDist.params;

    // convert the string to ChangeType enum
    this._incomeAmtOrPct = InvestmentType.convertAmtOrPct(data.incomeAmtOrPct);

    // parse the distribution type and parameters
    const incomeDist = InvestmentType.parseDistribution(
      data.incomeDistribution
    );
    this._incomeDistributionType = incomeDist.type;
    this._incomeDistributionParams = incomeDist.params;

    // convert the boolean to Taxability enum
    this.taxability = data.taxability
      ? Taxability.TAXABLE
      : Taxability.TAX_EXEMPT;
  }

  /**
   * generate the expected annual return
   * @param baseAmount the base amount, used to calculate the percentage return
   * @returns the expected annual return amount
   */
  generateExpectedAnnualReturn(baseAmount?: number): RandomGenerator {
    const returnValue = ValueGenerator(
      this._returnDistributionType,
      this._returnDistributionParams
    );

    return returnValue;
  }

  /**
   * generate the expected annual income
   * @param baseAmount the base amount, used to calculate the percentage income
   * @returns the expected annual income amount
   */
  generateExpectedAnnualIncome(baseAmount?: number): RandomGenerator {
    const incomeValue = ValueGenerator(
      this._incomeDistributionType,
      this._incomeDistributionParams
    );
    return incomeValue;
  }
}
