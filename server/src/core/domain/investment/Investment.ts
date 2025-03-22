import { InvestmentRaw } from "../scenario/Scenario";
import { InvestmentType, InvestmentTypeObject } from "./InvestmentType";
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
 * Represents an investment in the retirement planning system
 */
export class Investment {
  investmentType: InvestmentType;
  value: number;
  taxStatus: TaxStatus;
  id: string;

  /**
   * Constructor - accept the InvestmentRaw data from Scenario
   */
  constructor(data: InvestmentRaw) {
    this.investmentType = new InvestmentType(data.investmentType);
    this.value = data.value;

    // Convert string to TaxStatus enum
    switch (data.taxStatus) {
      case "non-retirement":
        this.taxStatus = TaxStatus.NON_RETIREMENT;
        break;
      case "pre-tax":
        this.taxStatus = TaxStatus.PRE_TAX;
        break;
      case "after-tax":
        this.taxStatus = TaxStatus.AFTER_TAX;
        break;
      default:
        throw new Error(`Invalid tax status: ${data.taxStatus}`);
    }

    this.id = data.id;
  }


  //? maybe not needed
  // /**
  //  * Get the expected annual return generator for this investment
  //  * @returns RandomGenerator for annual return
  //  */
  // getReturnGenerator(): RandomGenerator {
  //   return this.investmentType.generateExpectedAnnualReturn();
  // }

  // /**
  //  * Get the expected annual income generator for this investment
  //  * @returns RandomGenerator for annual income
  //  */
  // getIncomeGenerator(): RandomGenerator {
  //   return this.investmentType.generateExpectedAnnualIncome();
  // }

  // /**
  //  * Get a single sample of expected annual return
  //  * @returns A sample value of expected annual return
  //  */
  // getExpectedAnnualReturn(): RandomGenerator {
  //   return this.getReturnGenerator();
  // }

  // /**
  //  * Get a single sample of expected annual income
  //  * @returns A sample value of expected annual income
  //  */
  // getExpectedAnnualIncome(): RandomGenerator {
  //   return this.getIncomeGenerator();
  // }

  // /**
  //  * Apply the expected annual return to the investment value
  //  * @returns The new value after applying return
  //  */
  // applyAnnualReturn(): number {
  //   // Get return sample
  //   const returnSample = this.getExpectedAnnualReturn();

  //   // Apply return (whether fixed amount or percentage)
  //   this.value += returnSample.sample();

  //   // Apply expense ratio (which is always a percentage)
  //   const expenseAmount = this.value * this.investmentType.expenseRatio;
  //   this.value -= expenseAmount;

  //   return this.value;
  // }

  // /**
  //  * Get the expense amount for this investment
  //  * @returns The expense amount
  //  */
  // getExpenseAmount(): number {
  //   return this.value * this.investmentType.expenseRatio;
  // }

  // /**
  //  * Get public information about this investment
  //  * @returns InvestmentObject
  //  */
  // getPublicInfo(): InvestmentObject {
  //   return {
  //     id: this.id,
  //     investmentType:
  //       this.investmentType.getPublicInfo() as InvestmentTypeObject,
  //     value: this.value,
  //     taxStatus: this.taxStatus,
  //   };
  // }

  // /**
  //  * Create multiple investments from raw data
  //  * @param investmentsData Array of InvestmentRaw data
  //  * @returns Array of Investment instances
  //  */
  // static createInvestments(investmentsData: InvestmentRaw[]): Investment[] {
  //   return investmentsData.map((data) => new Investment(data));
  // }
}
