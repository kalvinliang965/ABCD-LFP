import { SimulationState } from "./SimulationState";
import { Scenario } from "../domain/scenario/Scenario";
import { TaxStatus } from "../Enums";
import { Investment } from "../domain/investment/Investment";
import { getRMDFactors } from "../../services/RMDScraper";

/**
 * Computes how income is shared between spouses based on their alive status
 * 
 * @param amount The total income amount
 * @param userPct User's percentage of the income
 * @param spousePct Spouse's percentage of the income
 * @param userAlive Whether the user is alive
 * @param spouseAlive Whether the spouse is alive
 * @returns The adjusted income amount
 */
function compute_spouse_income_share(
  amount: number, 
  userPct: number, 
  spousePct: number, 
  userAlive: boolean, 
  spouseAlive: boolean
): number {
  if (!userAlive && !spouseAlive) {
    return 0;
  } else if (userAlive && spouseAlive) {
    return amount; // full amount
  } else if (userAlive && !spouseAlive) {
    return amount * userPct;
  } else {
    return amount * spousePct;
  }
}

/**
 * Get the RMD distribution period for a given age
 * 
 * @param age The age to look up
 * @returns The distribution period from the RMD table
 */
async function get_distribution_period(age: number): Promise<number> {
  // Get RMD factors from the scraper service
  const rmdFactors = await getRMDFactors();
  
  // Cap at 120 years
  if (age > 120) {
    return 2.0;
  }
  
  return 0;       //need to implement.  ?????
}

/**
 * Calculate the total pre-tax balance for a person
 * 
 * @param state The simulation state
 * @param isPrimary Whether to calculate for primary user (true) or spouse (false)
 * @returns The total pre-tax balance
 */
function get_total_pre_tax_balance(
  state: SimulationState & Partial<Scenario>,
  isPrimary: boolean
): number {
  let total = 0;
  
  // Iterate through pre-tax accounts
  for (const [_, investment] of state.accounts.pre_tax) {
    // Check if this investment belongs to the person we're calculating for
    const isUserInvestment = (investment as any).user_fraction >= 0.5;
    
    if ((isPrimary && isUserInvestment) || (!isPrimary && !isUserInvestment)) {
      total += (investment as any).value;
    }
  }
  
  return total;
}

/**
 * Withdraw RMD from pre-tax accounts
 * 
 * @param state The simulation state
 * @param shortfall The amount that needs to be withdrawn
 * @param isPrimary Whether this is for the primary user (true) or spouse (false)
 * @returns The amount actually withdrawn
 */
function withdraw_rmd_from_pre_tax(
  state: SimulationState & Partial<Scenario>,
  shortfall: number,
  isPrimary: boolean
): number {
  let remaining = shortfall;
  let totalWithdrawn = 0;
  
  // Find cash account
  let cashAccount: Investment | undefined;
  for (const [id, investment] of state.accounts.non_retirement) {
    if (id.toLowerCase() === "cash") {
      cashAccount = investment;
      break;
    }
  }
  
  if (!cashAccount) {
    console.warn("No cash account found for RMD distributions");
    return 0;
  }
  
  // Iterate through pre-tax accounts in the order specified by RMD strategy
  for (const accountId of state.rmd_strategy || []) {
    if (remaining <= 0) break;
    
    const account = state.accounts.pre_tax.get(accountId);
    if (!account) continue;
    
    // Check if this account belongs to the person we're processing
    const isUserAccount = (account as any).user_fraction >= 0.5;
    if ((isPrimary && !isUserAccount) || (!isPrimary && isUserAccount)) {
      continue;
    }
    
    // Determine how much to withdraw
    const accountValue = (account as any).value;
    const withdrawAmount = Math.min(accountValue, remaining);
    
    if (withdrawAmount <= 0) continue;
    
    // Update account balance
    (account as any).value -= withdrawAmount;
    
    // Add to cash
    (cashAccount as any).value += withdrawAmount;
    
    // Update taxable income (RMDs are taxable as ordinary income)
    state.incr_ordinary_income(withdrawAmount);
    
    // Update tracking
    remaining -= withdrawAmount;
    totalWithdrawn += withdrawAmount;
    
    console.log(`RMD withdrawal from ${accountId}: $${withdrawAmount.toFixed(2)}`);
  }
  
  return totalWithdrawn;
}

/**
 * Process Required Minimum Distributions (RMDs) for the simulation
 * 
 * @param state The simulation state
 * @returns The total RMD amount processed
 */
export default async function process_rmds(
  state: SimulationState & Partial<Scenario>
): Promise<number> {
  let totalRmdAmount = 0;
  const currentYear = state.get_current_year();
  const rmdStartAge = 72; // Current IRS rule (as of 2023)
  
  // Process RMDs for both user and spouse
  const persons = [
    { 
      name: "user", 
      isPrimary: true,
      age: state.user.get_age(),
      alive: state.user.is_alive(),
      fraction: 0.6 // Default user fraction if not specified
    },
    { 
      name: "spouse", 
      isPrimary: false,
      age: state.spouse ? state.spouse.get_age() : 0,
      alive: state.spouse ? state.spouse.is_alive() : false,
      fraction: 0.4 // Default spouse fraction
    }
  ];
  
  // Track if RMD was triggered this year
  let rmdTriggered = false;
  
  for (const person of persons) {
    // Skip if person is not alive or not old enough for RMD
    if (!person.alive || person.age < rmdStartAge) {
      continue;
    }
    
    // Get total pre-tax balance for this person
    const totalPreTaxBalance = get_total_pre_tax_balance(state, person.isPrimary);
    
    if (totalPreTaxBalance <= 0) {
      continue; // No RMD needed if no pre-tax funds
    }
    
    // Get distribution period from RMD table
    const distributionPeriod = await get_distribution_period(person.age);
    
    if (distributionPeriod <= 0) {
      console.warn(`Invalid distribution period for age ${person.age}`);
      continue;
    }
    
    // Calculate Required Minimum Distribution
    const requiredRmd = totalPreTaxBalance / distributionPeriod;
    
    // Check if Roth conversions already covered part of the RMD
    // This would need to be implemented based on your Roth conversion tracking
    const alreadyWithdrawn = 0; // Placeholder - implement based on your Roth conversion logic
    
    // Calculate shortfall if Roth conversion didn't fully cover RMD
    if (alreadyWithdrawn < requiredRmd) {
      const shortfall = requiredRmd - alreadyWithdrawn;
      const withdrawnAmount = withdraw_rmd_from_pre_tax(state, shortfall, person.isPrimary);
      
      totalRmdAmount += withdrawnAmount;
      
      if (withdrawnAmount > 0) {
        rmdTriggered = true;
      }
    }
  }
  
  // Store RMD triggered status in simulation state if needed
  (state as any).rmd_triggered = rmdTriggered;
  
  return totalRmdAmount;
}
