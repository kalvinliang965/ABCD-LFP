import { InvestmentRaw } from "../scenario/Scenario";
import InvestmentType from "./InvestmentType";
import { InvestmentTypeObject } from "./InvestmentType";
import { TaxStatus } from "../../Enums";
import { RandomGenerator } from "../../../utils/math/ValueGenerator";

//todo:明天看 3/21

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

/**
 * Create multiple investments from raw data
 * @param investmentsData Array of InvestmentRaw data
 * @returns Array of Investment instances
 */
export function createInvestments(
  investmentsData: InvestmentRaw[]
): InvestmentObject[] {
  return investmentsData.map((raw_data) => Investment(raw_data));
}

//? maybe not needed - these functions can be added back if needed
/*
export function getReturnGenerator(investment: InvestmentObject): RandomGenerator {
  return investment.investmentType.generateExpectedAnnualReturn();
}

export function getIncomeGenerator(investment: InvestmentObject): RandomGenerator {
  return investment.investmentType.generateExpectedAnnualIncome();
}

export function getExpectedAnnualReturn(investment: InvestmentObject): RandomGenerator {
  return getReturnGenerator(investment);
}

export function getExpectedAnnualIncome(investment: InvestmentObject): RandomGenerator {
  return getIncomeGenerator(investment);
}

export function applyAnnualReturn(investment: InvestmentObject): number {
  // Get return sample
  const returnSample = getExpectedAnnualReturn(investment);

  // Apply return (whether fixed amount or percentage)
  investment.value += returnSample.sample();

  // Apply expense ratio (which is always a percentage)
  const expenseAmount = investment.value * investment.investmentType.expenseRatio;
  investment.value -= expenseAmount;

  return investment.value;
}

export function getExpenseAmount(investment: InvestmentObject): number {
  return investment.value * investment.investmentType.expenseRatio;
}
*/
