// src/core/simulation/ProcessIncome.ts

import { ChangeType } from "../../Enums";
import { SimulationState } from "../SimulationState";
import { Event as DomainEvent } from "../../domain/event/Event";
import { Scenario } from "../../domain/scenario/Scenario";
import ValueGenerator from "../../../utils/math/ValueGenerator";


// run income events, adding the income to cash investment
export default async function run_income_event(
  state: SimulationState
): Promise<number> {
  let total_income_for_year = 0;
  const currentYear = state.get_current_year();
  
  const userAlive = state.user.is_alive();
  const spouseAlive = state.spouse?.is_alive() || false;
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
