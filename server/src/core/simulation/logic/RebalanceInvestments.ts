// src/core/simulation/RebalanceInvestments.ts
import { SimulationState } from '../SimulationState';
import { Scenario } from '../../domain/scenario/Scenario';
import { Investment } from '../../domain/investment/Investment';
import { TaxStatus } from '../../Enums';
import { Event } from '../../domain/event/Event';

// Define the RebalanceEvent interface
interface RebalanceEvent extends Event {
  asset_allocation: Map<string, number>;
}

// Group investments by tax status
function groupInvestmentsByTaxStatus(
  state: SimulationState,
  investmentIds: string[]
): Map<TaxStatus, Investment[]> {
  const groupedInvestments = new Map<TaxStatus, Investment[]>();
  
  for (const investmentId of investmentIds) {
    const investment = findInvestment(state, investmentId);
    if (!investment) continue;
    
    const taxStatus = investment.taxStatus;
    if (!groupedInvestments.has(taxStatus)) {
      groupedInvestments.set(taxStatus, []);
    }
    
    groupedInvestments.get(taxStatus)!.push(investment);
  }
  
  return groupedInvestments;
}

//find investments
function findInvestment(
  state: SimulationState,
  investmentId: string
): Investment | undefined {
  //search in all account types
  for (const accountType of [
    'non_retirement', 'pre_tax', 'after_tax'
  ] as const) {
    if (state.account_manager[accountType].has(investmentId)) {
      return state.account_manager[accountType].get(investmentId);
    }
  }
  return undefined;
}

export function rebalanceInvestments(
  state: SimulationState,
  scenario: Scenario
): void {
  // Get all rebalance events
  const rebalanceEvents = state.events_by_type.rebalance;
  if (!rebalanceEvents || rebalanceEvents.size === 0) {
    return;
  }
  
  //process each rebalance event
  for (const event of rebalanceEvents.values()) {
    //cast to RebalanceEvent
    const rebalanceEvent = event as RebalanceEvent;
    
    // Check if the event is active for the current year
    if (state.get_current_year() < rebalanceEvent.start || 
        state.get_current_year() >= rebalanceEvent.start + rebalanceEvent.duration) {
      continue;
    }
    
    //get all investments referenced in the asset allocation
    const investmentIds = Array.from(rebalanceEvent.asset_allocation.keys());
    
    //group investments by tax status
    const investmentsByTaxStatus = groupInvestmentsByTaxStatus(state, investmentIds);
    
    //process each tax status group separately
    for (const [taxStatus, investments] of investmentsByTaxStatus.entries()) {
      if (investments.length === 0) {
        console.warn(`No valid investments found for rebalancing with tax status ${taxStatus}`);
        continue;
      }
      
      //calculate total value of all investments in this tax status group
      let totalValue = 0;
      for (const investment of investments) {
        totalValue += investment.get_value();
      }
      
      //create a filtered allocation map for this tax status
      const taxStatusAllocation = new Map<string, number>();
      for (const [investmentId, percentage] of rebalanceEvent.asset_allocation.entries()) {
        const investment = investments.find(inv => inv.id === investmentId);
        if (investment) {
          taxStatusAllocation.set(investmentId, percentage);
        }
      }
      
      //verify that the allocation percentages sum to 100
      let totalPercentage = 0;
      for (const percentage of taxStatusAllocation.values()) {
        totalPercentage += percentage;
      }
      
      const epsilon = 0.01; //epsilon for floating point comparison
      
      if (Math.abs(totalPercentage - 100) > epsilon) {
        console.error(`Allocation percentages sum to ${totalPercentage}, not 100. Skipping rebalancing for tax status ${taxStatus}.`);
        continue;
      }
      
      //for each investment, calculate target value and perform rebalancing
      for (const [investmentId, targetPercentage] of taxStatusAllocation.entries()) {
        const investment = investments.find(inv => inv.id === investmentId);
        
        if (!investment) continue;
        
        const targetValue = totalValue * (targetPercentage / 100);
        const currentValue = investment.get_value();
        
        if (currentValue < targetValue) {
          //buy more of this investment
          const amountToBuy = targetValue - currentValue;
          state.cash.incr_value(-amountToBuy);
          investment.incr_value(amountToBuy);
          investment.incr_cost_basis(amountToBuy);
        } 
        else if (currentValue > targetValue) {
          //sell some of this investment
          const amountToSell = currentValue - targetValue;
          state.cash.incr_value(amountToSell);
          investment.incr_value(-amountToSell);
          
          //calculate capital gains/losses for non-tax-exempt accounts
          if (taxStatus !== TaxStatus.PRE_TAX) {
            const unrealizedGains = currentValue - investment.get_cost_basis();
            const sellProportion = amountToSell / currentValue;
            const capitalGainLoss = unrealizedGains * sellProportion;
            
            //add to capital gains income
            state.incr_capital_gains_income(capitalGainLoss);
            
            //adjust cost basis proportionally to the amount sold
            investment.incr_cost_basis(-(investment.get_cost_basis() * sellProportion));
          }
        }
      }
    }
  }
}
