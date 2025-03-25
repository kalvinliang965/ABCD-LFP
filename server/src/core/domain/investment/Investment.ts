import { InvestmentRaw } from "../scenario/Scenario";
import { create_investment_type, InvestmentType } from "./InvestmentType";
import { ChangeType, Taxability, TaxStatus } from "../../Enums";

/**
 * Public information about an investment
 */
export interface Investment {
  id: string;
  taxStatus: TaxStatus;
  investment_type: InvestmentType;

  return_change_type: ChangeType,
  income_change_type: ChangeType,

  get_value(): number,
  get_cost_basis(): number,
  incr_value(amt: number): void,
  incr_cost_basis(amt: number): void,

  get_expense_ratio(): number
  get_annual_income(): number,
  get_annual_return(): number,
  is_retirement(): boolean,
  is_tax_exempt(): boolean,
  clone(): Investment,
}

/**
 * Factory function to create an investment in the retirement planning system
 */
export function create_investment(raw_data: InvestmentRaw): Investment {
  try {
    const investment_type = create_investment_type(raw_data.investmentType);
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

      return_change_type: investment_type.return_change_type,
      income_change_type: investment_type.income_change_type,

      get_value: () => value,
      get_cost_basis: () => cost_basis,
      incr_value: (amt: number) => value += amt,
      incr_cost_basis: (amt: number) => cost_basis += amt,
      
      get_expense_ratio: () => investment_type.expense_ratio,
      get_annual_income: () => investment_type.expect_annual_income.sample(),
      get_annual_return: () => investment_type.expect_annual_return.sample(),
      is_retirement: () => taxStatus === TaxStatus.AFTER_TAX || taxStatus === TaxStatus.PRE_TAX,
      is_tax_exempt: () => investment_type.taxability === Taxability.TAX_EXEMPT,
      clone: () => create_investment(raw_data),
    }

    return investment;
  } catch (error) {
    console.error("Error creating investment:", error);
    throw new Error("Error creating investment");
  }
}