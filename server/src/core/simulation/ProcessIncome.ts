// src/core/simulation/ProcessIncome.ts

import { ChangeType } from "../Enums";
import { SimulationState } from "./SimulationState";
import { Event } from "../domain/event/Event";
import { Scenario } from "../domain/scenario/Scenario";
import ValueGenerator from "../../utils/math/ValueGenerator";

/**
 * Process all income events for the current simulation year
 * This function identifies active income events for the current year
 */
export default function process_income(
    state: SimulationState & Partial<Scenario>
    //used to test
//   state: {
//     get_current_year: () => number;
//     inflation_factor: number;
//     user: { is_alive: () => boolean };
//     spouse?: { is_alive: () => boolean };
//     events_by_type: { income: Map<string, any> };
//     incr_ordinary_income: (amt: number) => void;
//     incr_social_security_income: (amt: number) => void;
//   }
): number {
  let total_income_for_year = 0;
  const currentYear = state.get_current_year();
  
  // Get user and spouse alive status
  const userAlive = state.user.is_alive();
  const spouseAlive = state.spouse ? state.spouse.is_alive() : false;
  
  // Identify income events that are active in the current year
  const activeIncomeEvents: Event[] = [];
  for (const [_, event] of state.events_by_type.income) {
    if (is_event_active(event, currentYear)) {
      activeIncomeEvents.push(event);
    }
  }
  
  // Process each active income event
  for (const event of activeIncomeEvents) {
    // Calculate years active
    const yearsActive = currentYear - event.start;
    
    // Calculate the income amount for the current year
    const incomeAmount = calculate_event_amount(
      event,
      (event as any).initial_amount,
      yearsActive,
      state.inflation_factor
    );
    
    // Adjust income based on user/spouse alive status
    const userPct = (event as any).user_fraction || 1.0;
    const spousePct = 1.0 - userPct;
    
    const adjustedAmount = compute_spouse_income_share(
      incomeAmount,
      userPct,
      spousePct,
      userAlive,
      spouseAlive
    );
    
    // Skip if no income after adjustment
    if (adjustedAmount <= 0) {
      continue;
    }
    
    // Add to appropriate income category
    if ((event as any).social_security) {
      state.incr_social_security_income(adjustedAmount);
    } else {
      state.incr_ordinary_income(adjustedAmount);
    }
    
    // Add to total income
    total_income_for_year += adjustedAmount;
    
    // For tracking/reporting purposes
    (event as any).processed_amount = adjustedAmount;
    
    // Log income processing (for debugging)
    console.log(`Processed income event: ${event.name}, amount: ${adjustedAmount.toFixed(2)}`);
  }
  
  return total_income_for_year;
}

/**
 * Computes how income is shared between spouses based on their alive status
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
 * Helper function to calculate the current amount for an event
 * Supports both fixed/percentage changes and distribution-based changes
 */
function calculate_event_amount(
  event: any,
  initial_amount: number,
  years_active: number,
  inflation_factor: number
): number {
  let amount = initial_amount;
  
  // Apply annual changes for each year the event has been active
  for (let i = 0; i < years_active; i++) {
    // Get the change amount based on change type and distribution
    const changeAmount = get_change_amount(event);
    
    if (event.change_type === ChangeType.FIXED) {
      amount += changeAmount;
    } else if (event.change_type === ChangeType.PERCENTAGE) {
      amount *= (1 + changeAmount);
    }
    
    // Apply inflation adjustment if needed
    if (event.inflation_adjusted) {
      amount *= (1 + inflation_factor);
    }
  }
  
  return amount;
}

/**
 * Get the change amount based on the event's distribution type and parameters
 */
function get_change_amount(event: any): number {
  // If the event has a distribution type, use it to sample a value
  //not sure if this is needed since we could directly use the expected_annual_change ???
  if (event.distribution_type) {
    // Create a value generator based on the distribution type and parameters
    const valueGenerator = ValueGenerator(
      event.distribution_type,
      event.distribution_params
    );
    
    // Sample a value from the distribution
    return valueGenerator.sample();
  }
  
  // Otherwise, use the expected_annual_change directly
  return event.expected_annual_change || 0;
}

/**
 * Helper function to check if an event is active in the current year
 */
function is_event_active(event: Event, current_year: number): boolean {
  return (
    current_year >= event.start && 
    current_year < event.start + event.duration
  );
}

//1) the change type has some issuse, which is not either fixed amount or percentage
//2) adjust the test case I used for the income processing
//3) update the demo to test the user case
//4) process_rmds is not implemented for the question marks