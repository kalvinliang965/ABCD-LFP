// import { SimulationState } from "./SimulationState";
// import { Scenario } from "../domain/scenario/Scenario";
// import { TaxStatus } from "../Enums";
// import { Investment } from "../domain/investment/Investment";
// import getRMDFactors from "../../services/RMDScraper";

// /**
//  * Get the RMD distribution period for a given age
//  * 
//  * @param age The age to look up
//  * @returns The distribution period from the RMD table
//  */
// async function get_distribution_period(age: number): Promise<number> {
//   // Hardcoded RMD factors based on IRS Uniform Lifetime Table (2022+)
//   // This is a fallback until the scraper is implemented
//   const RMD_FACTORS = new Map([
//     [72, 27.4], [73, 26.5], [74, 25.5], [75, 24.6], [76, 23.7], [77, 22.9], 
//     [78, 22.0], [79, 21.1], [80, 20.2], [81, 19.4], [82, 18.5], [83, 17.7], 
//     [84, 16.8], [85, 16.0], [86, 15.2], [87, 14.4], [88, 13.7], [89, 12.9], 
//     [90, 12.2], [91, 11.5], [92, 10.8], [93, 10.1], [94, 9.5], [95, 8.9], 
//     [96, 8.4], [97, 7.8], [98, 7.3], [99, 6.8], [100, 6.4], [101, 6.0], 
//     [102, 5.6], [103, 5.2], [104, 4.9], [105, 4.6], [106, 4.3], [107, 4.1], 
//     [108, 3.9], [109, 3.7], [110, 3.5], [111, 3.4], [112, 3.3], [113, 3.1], 
//     [114, 3.0], [115, 2.9], [116, 2.8], [117, 2.7], [118, 2.5], [119, 2.3], 
//     [120, 2.0]
//   ]);
  
//   // Cap at 120 years
//   if (age > 120) {
//     return RMD_FACTORS.get(120) || 2.0;
//   }
  
//   return RMD_FACTORS.get(age) || 0;
// }

// /**
//  * Find a cash account in the non-retirement accounts
//  * 
//  * @param state The simulation state
//  * @returns The cash account, or undefined if not found
//  */
// function find_cash_account(state: SimulationState & Partial<Scenario>): Investment | undefined {
//   for (const [id, investment] of state.accounts.non_retirement) {
//     // Look for an account named "cash" (case insensitive)
//     if (id.toLowerCase() === "cash" || investment.name.toLowerCase() === "cash") {
//       return investment;
//     }
//   }
//   return undefined;
// }

// /**
//  * Process Required Minimum Distributions (RMDs) for the user
//  * 
//  * @param state The simulation state
//  * @returns The total RMD amount processed
//  */
// export default async function process_rmds(
//   state: SimulationState & Partial<Scenario>
// ): Promise<number> {
//   // Only process RMDs for the user (not spouse)
//   const userAge = state.user.get_age();
//   const userAlive = state.user.is_alive();
//   const rmdStartAge = 72; // Current IRS rule (as of 2023)
  
//   // Check if the user is alive and old enough for RMD
//   if (!userAlive || userAge < rmdStartAge) {
//     // No RMD needed
//     return 0;
//   }
  
//   // Get total pre-tax retirement account balance
//   let totalRmdAmount = 0;
//   let totalPreTaxBalance = 0;
  
//   // Calculate total balance in pre-tax accounts
//   for (const [_, account] of state.accounts.pre_tax) {
//     totalPreTaxBalance += (account as any).value;
//   }
  
//   if (totalPreTaxBalance <= 0) {
//     // No RMD needed if there are no pre-tax funds
//     return 0;
//   }
  
//   // Get distribution period from RMD table
//   const distributionPeriod = await get_distribution_period(userAge);
  
//   if (distributionPeriod <= 0) {
//     console.warn(`Invalid distribution period for age ${userAge}`);
//     return 0;
//   }
  
//   // Calculate Required Minimum Distribution (RMD)
//   const requiredRmd = totalPreTaxBalance / distributionPeriod;
  
//   // Process the RMD withdrawal
//   let remainingRmd = requiredRmd;
  
//   // Find cash account for receiving the RMD
//   const cashAccount = find_cash_account(state);
  
//   if (!cashAccount) {
//     console.warn("No cash account found for RMD distributions");
//     return 0;
//   }
  
//   // Withdraw from pre-tax accounts according to RMD strategy
//   for (const accountId of state.rmd_strategy || []) {
//     if (remainingRmd <= 0) {
//       break;
//     }
    
//     const account = state.accounts.pre_tax.get(accountId);
//     if (!account) {
//       continue;
//     }
    
//     // Determine how much to withdraw from this account
//     const accountValue = (account as any).value;
//     const withdrawAmount = Math.min(accountValue, remainingRmd);
    
//     if (withdrawAmount <= 0) {
//       continue;
//     }
    
//     // Update account balance
//     (account as any).value -= withdrawAmount;
    
//     // Transfer to cash account (non-retirement)
//     (cashAccount as any).value += withdrawAmount;
    
//     // Add to ordinary income (RMDs are taxable)
//     state.incr_ordinary_income(withdrawAmount);
    
//     // Update tracking
//     remainingRmd -= withdrawAmount;
//     totalRmdAmount += withdrawAmount;
    
//     console.log(`RMD withdrawal from ${accountId}: $${withdrawAmount.toFixed(2)}`);
//   }
  
//   // Mark that RMD was processed
//   (state as any).rmd_triggered = (totalRmdAmount > 0);
  
//   return totalRmdAmount;
// }
