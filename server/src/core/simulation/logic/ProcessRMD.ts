import { SimulationState } from "../SimulationState";
import { Scenario } from "../../domain/scenario/Scenario";
//import { TaxStatus } from "../Enums";
import { Investment } from "../../domain/investment/Investment";
import { getRMDFactorForAge } from "../../../services/RMDScraper";
import { rmd_urls, rmd_config } from "../../../config/rmd";

/**
 * Get the RMD distribution period for a given age
 */
async function get_distribution_period(age: number): Promise<number> {
  return await getRMDFactorForAge(age, rmd_urls.RMD_PUBLICATION);
}

/**
 * Find a cash account in the non-retirement accounts
 */
function find_cash_account(state: SimulationState & Partial<Scenario>): Investment | undefined {
  for (const [id, investment] of state.account_manager.non_retirement) {
    // Look for an account named "cash" (case insensitive)
    if (id.toLowerCase() === "cash") {
      return investment;
    }
  }
  return undefined;
}

/**
 * Process Required Minimum Distributions (RMDs) for the user
 */
export default async function process_rmds(
  state: SimulationState & Partial<Scenario>
): Promise<number> {
  // Only process RMDs for the user (not spouse)
  const userAge = state.user.get_age();
  const userAlive = state.user.is_alive();
  const rmdStartAge = rmd_config.START_AGE; // Use the value from config
  
  // Check if the user is alive and old enough for RMD
  if (!userAlive || userAge < rmdStartAge) {
    // No RMD needed
    return 0;
  }
  
  // Get total pre-tax retirement account balance
  let totalRmdAmount = 0;
  let totalPreTaxBalance = 0;
  
  // Calculate total balance in pre-tax accounts
  for (const [_, account] of state.account_manager.pre_tax) {
    totalPreTaxBalance += (account as any).value;
  }
  
  if (totalPreTaxBalance <= 0) {
    // No RMD needed if there are no pre-tax funds
    return 0;
  }
  
  // Get distribution period from RMD table
  const distributionPeriod = await get_distribution_period(userAge);
  
  if (distributionPeriod <= 0) {
    console.warn(`Invalid distribution period for age ${userAge}`);
    return 0;
  }
  
  // Calculate Required Minimum Distribution (RMD)
  const requiredRmd = totalPreTaxBalance / distributionPeriod;
  
  // Process the RMD withdrawal
  let remainingRmd = requiredRmd;
  
  // Find cash account for receiving the RMD
  let cashAccount = find_cash_account(state);
  
  if (!cashAccount) {
    console.warn("No cash account found for RMD distributions, creating one");
    cashAccount = { value: 0 } as any; // Simplified version using type assertion
    state.account_manager.non_retirement.set('cash', cashAccount as Investment);
  }
  
  // Calculate RMD amount for each account proportionally
  const accountRmds = new Map<string, number>();
  let totalRmdAccountsValue = 0;
  
  // First, calculate the total value of accounts in the RMD strategy
  for (const accountId of state.rmd_strategy || []) {
    const account = state.account_manager.pre_tax.get(accountId);
    if (account) {
      totalRmdAccountsValue += (account as any).value;
    }
  }
  //show add a rmd_strategy to the InvestmentType ????
  // Then calculate proportional RMD for each account
  for (const accountId of state.rmd_strategy || []) {
    const account = state.account_manager.pre_tax.get(accountId);
    if (!account) continue;
    
    const accountValue = (account as any).value;
    // Calculate this account's share of the total RMD
    const accountRmd = (accountValue / totalRmdAccountsValue) * requiredRmd;
    accountRmds.set(accountId, accountRmd);
  }
  
  // Now process the withdrawals
  for (const [accountId, withdrawAmount] of accountRmds.entries()) {
    if (withdrawAmount <= 0) continue;
    
    const account = state.account_manager.pre_tax.get(accountId);
    if (!account) continue;
    
    // Update account balance
    (account as any).value -= withdrawAmount;
    
    // Transfer to cash account (non-retirement)
    (cashAccount as any).value += withdrawAmount;
    
    // Update tracking
    //transfer RMD funds directly to non-retirement accounts
    totalRmdAmount += withdrawAmount;
    
    console.log(`RMD withdrawal from ${accountId}: $${withdrawAmount.toFixed(2)}`);
  }
  
  // Mark that RMD was processed
  (state as any).rmd_triggered = (totalRmdAmount > 0);
  
  // Add the total RMD to ordinary income (call once with total)
  if (totalRmdAmount > 0) {
    // Round to 2 decimal places for currency
    const roundedAmount = Math.round(totalRmdAmount * 100) / 100;
    state.incr_ordinary_income(roundedAmount);
  }
  
  return totalRmdAmount;
}

export {
  process_rmds,
}