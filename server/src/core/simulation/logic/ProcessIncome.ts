// src/core/simulation/ProcessIncome.ts

import { ChangeType } from "../../Enums";
import { SimulationState } from "../SimulationState";
import { Event as DomainEvent } from "../../domain/event/Event";
import { Scenario } from "../../domain/scenario/Scenario";
import ValueGenerator from "../../../utils/math/ValueGenerator";

// Define interfaces to match your YAML structure
interface Investment {
  id: string;
  value: number;
  investment_type: InvestmentType | string;
}

interface InvestmentType {
  name: string;
  taxability?: boolean;
  incomeDistribution?: Map<string, any>;
  incomeAmtOrPct?: string;
}

/**
 * Process income for all investments
 * 
 * @param state The simulation state
 * @returns The total income processed
 */
export default async function process_income(
  state: SimulationState & Partial<Scenario>
): Promise<number> {
  let total_income_for_year = 0;
  const currentYear = state.get_current_year();
  
  // Get user and spouse alive status
  const userAlive = state.user.is_alive();
  const spouseAlive = state.spouse?.is_alive() || false;
  
  // Process income from investments
  // Non-retirement accounts
  for (const [id, investment] of state.account_manager.non_retirement) {
    const income = calculate_investment_income(investment);
    if (income > 0) {
      total_income_for_year += income;
      
      // Update the investment value by adding the income
      (investment as any).value += income;
      
      // Track income for tax purposes
      if (typeof investment.investment_type === 'string') {
        // Handle string investment types (from YAML)
        const isStock = investment.investment_type.toLowerCase().includes('stock');
        if (isStock) {
          (state as any).incr_qualified_dividends(income);
        } else {
          (state as any).incr_ordinary_income(income);
        }
      } else if (investment.investment_type && typeof investment.investment_type === 'object') {
        // Handle object investment types
        const investType = investment.investment_type as InvestmentType;
        if (investType.taxability) {
          const typeName = investType.name || '';
          if (typeName.toLowerCase().includes('stock')) {
            (state as any).incr_qualified_dividends(income);
          } else {
            (state as any).incr_ordinary_income(income);
          }
        }
      }
    }
  }
  
  // Pre-tax retirement accounts
  for (const [id, investment] of state.account_manager.pre_tax) {
    const income = calculate_investment_income(investment);
    if (income > 0) {
      total_income_for_year += income;
      
      // Update the investment value by adding the income
      (investment as any).value += income;
      
      // No tax implications for income inside pre-tax accounts
    }
  }
  
  // Identify income events that are active in the current year
  const activeIncomeEvents: DomainEvent[] = [];
  for (const [_, event] of state.events_by_type.income) {
    if (is_event_active(event, currentYear)) {
      activeIncomeEvents.push(event);
    }
  }
  
  // Process income from events
  for (const event of activeIncomeEvents) {
    // Add event income to total
    const eventIncome = (event as any).amount || 0;
    total_income_for_year += eventIncome;
    
    // Track income for tax purposes
    if ((event as any).is_qualified) {
      (state as any).incr_qualified_dividends(eventIncome);
    } else {
      (state as any).incr_ordinary_income(eventIncome);
    }
  }
  
  return total_income_for_year;
}

/**
 * Calculate income for a single investment
 * 
 * @param investment The investment to calculate income for
 * @returns The income amount
 */
function calculate_investment_income(investment: any): number {
  const investmentType = investment.investment_type;
  const value = investment.value;
  
  // Handle string investment types (from YAML)
  if (typeof investmentType === 'string') {
    // Default behavior for string investment types
    // You might want to implement a mapping from string types to income rates
    return 0;
  }
  
  if (!investmentType || !investmentType.incomeDistribution) {
    return 0;
  }
  
  const distributionType = investmentType.incomeDistribution.get('type');
  
  if (distributionType === 'fixed') {
    const incomeValue = investmentType.incomeDistribution.get('value');
    
    if (investmentType.incomeAmtOrPct === 'percent') {
      // Percentage-based income
      return value * incomeValue;
    } else {
      // Fixed amount income
      return incomeValue;
    }
  }
  
  // For other distribution types (normal, etc.), implement as needed
  return 0;
}

/**
 * Check if an event is active in the given year
 * 
 * @param event The event to check
 * @param year The year to check
 * @returns True if the event is active
 */
function is_event_active(event: any, year: number): boolean {
  const startYear = event.start_year || 0;
  const endYear = event.end_year || Infinity;
  
  return year >= startYear && year <= endYear;
}

interface IncomeEvent {
  id: string;
  name: string;
  start_year: number;
  end_year: number;
  amount: number;
  is_qualified: boolean;
}
