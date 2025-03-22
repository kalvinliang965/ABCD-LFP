import { InvestmentRaw } from "../scenario/Scenario";
import InvestmentType from "./InvestmentType";
import { InvestmentTypeObject } from "./InvestmentType";
import { TaxStatus } from "../../Enums";

/**
 * Public information about an investment
 */
export interface InvestmentObject {
  investmentType: InvestmentTypeObject;
  value: number;
  taxStatus: TaxStatus;
  id: string;
}

/**
 * Factory function to create an investment in the retirement planning system
 */
export function Investment(raw_data: InvestmentRaw): InvestmentObject {
  try {
    const investmentType = InvestmentType(raw_data.investmentType);
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

    return {
      investmentType,
      value: raw_data.value,
      taxStatus,
      id: raw_data.id,
    };
  } catch (error) {
    console.error("Error creating investment:", error);
    throw new Error("Error creating investment");
  }
}