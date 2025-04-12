import { create_investment_type, InvestmentType } from "./InvestmentType";
import { ChangeType, TaxStatus } from "../../Enums";
import { InvestmentRaw } from "../raw/investment_raw";
import { Cloneable } from "../../../utils/helper";
/**
 * Public information about an investment
 */
export interface Investment extends Cloneable<Investment> {
  id: string;
  taxStatus: TaxStatus;
  investment_type: string;
  get_value(): number;
  get_cost_basis(): number;
  incr_value(amt: number): void;
  incr_cost_basis(amt: number): void;
  is_retirement(): boolean;
  clone(): Investment;
}

/**
 * Factory function to create an investment in the retirement planning system
 */
export function create_investment(raw_data: InvestmentRaw): Investment {
  try {
    const investment_type = raw_data.investmentType;
    let taxStatus: TaxStatus;

    // Convert string to TaxStatus enum
    switch (raw_data.taxStatus) {
      case "non-retirement":
        taxStatus = TaxStatus.NON_RETIREMENT;
        break;
      case "pre-tax":
        taxStatus = TaxStatus.PRE_TAX;
        break;
      case "after-tax":
        taxStatus = TaxStatus.AFTER_TAX;
        break;
      default:
        throw new Error(`Invalid tax status: ${raw_data.taxStatus}`);
    }
    // how much we bought the investment for
    let cost_basis = raw_data.value;
    // how much we invested
    let value = raw_data.value;
    const investment = {
      investment_type,
      taxStatus,
      id: raw_data.id,
      get_value: () => value,
      get_cost_basis: () => cost_basis,
      incr_value: (amt: number) => (value += amt),
      incr_cost_basis: (amt: number) => (cost_basis += amt),
      is_retirement: () =>
        taxStatus === TaxStatus.AFTER_TAX || taxStatus === TaxStatus.PRE_TAX,
      clone: () => create_investment(raw_data),
    };

    return investment;
  } catch (error) {
    console.error("Error creating investment:", error);
    throw new Error("Error creating investment");
  }
}
