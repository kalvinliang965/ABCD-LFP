import { create_investment_type, InvestmentType } from "./InvestmentType";
import { ChangeType, TaxStatus } from "../../Enums";
import { InvestmentRaw } from "../raw/investment_raw";
import { Cloneable } from "../../../utils/CloneUtil";
import { has_required_word_occurrences } from "../../../utils/general";
/**
 * Public information about an investment
 */
export interface Investment extends Cloneable<Investment> {
  old_id: string;
  id: string;
  tax_status: TaxStatus;
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
    let tax_status: TaxStatus;

    // Convert string to TaxStatus enum
    switch (raw_data.taxStatus) {
      case "non-retirement":
        tax_status = TaxStatus.NON_RETIREMENT;
        break;
      case "pre-tax":
        tax_status = TaxStatus.PRE_TAX;
        break;
      case "after-tax":
        tax_status = TaxStatus.AFTER_TAX;
        break;
      default:
        throw new Error(`Invalid tax status: ${raw_data.taxStatus}`);
    }

    // reformat the id of it contain some tax status
    let old_id: string = raw_data.id;
    let id: string = old_id;
    // the id must contain both [investment type] + [tax_status]
    if (!has_required_word_occurrences(old_id, [tax_status.valueOf(), investment_type])) {
      id = investment_type + " " + tax_status.valueOf();    
    }

    // how much we bought the investment for
    let cost_basis = raw_data.value;
    // how much we invested
    let value = raw_data.value;
    const investment = {
      investment_type,
      tax_status,
      old_id: raw_data.id,
      id,
      get_value: () => value,
      get_cost_basis: () => cost_basis,
      incr_value: (amt: number) => (value += amt),
      incr_cost_basis: (amt: number) => (cost_basis += amt),
      is_retirement: () =>
        tax_status === TaxStatus.AFTER_TAX || tax_status === TaxStatus.PRE_TAX,
      clone: () => create_investment(raw_data),
    };

    return investment;
  } catch (error) {
    console.error("Error creating investment:", error);
    throw new Error("Error creating investment");
  }
}
