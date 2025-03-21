import { DistributionType, Taxability, ChangeType } from "../../Enums";
import ValueGenerator from "../../../utils/math/ValueGenerator";

/**
 * Represents a distribution with a specific type and associated values
 */
/**
 * Represents an investment type in the retirement planning system
 */
export class InvestmentType {
  name: string;
  description?: string;
  returnAmtOrPct: string;
  returnDistribution: Distribution;
  expenseRatio: number;
  incomeAmtOrPct: string;
  incomeDistribution: Distribution;
  taxability: string;

  constructor(
    name: string,
    returnAmtOrPct: string,
    returnDistribution: Distribution,
    expenseRatio: number,
    incomeAmtOrPct: string,
    incomeDistribution: Distribution,
    taxability: string,
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
   * Creates an InvestmentType instance from raw data
   */
  static fromData(data: any): InvestmentType {
    // Convert boolean taxability to enum
    const taxabilityEnum = data.taxability
      ? Taxability.TAXABLE
      : Taxability.TAX_EXEMPT;

    return new InvestmentType(
      data.name,
      data.expenseRatio,
      data.taxability,
      data.description
    );
  }
}
