// src/core/simulation/RebalanceInvestments.ts
import { SimulationState } from './SimulationState';
import { Scenario } from '../domain/scenario/Scenario';
import { Investment } from '../domain/investment/Investment';
import { TaxStatus } from '../Enums';

//get current rebalance event for the given year
function getCurrentRebalanceEvent(
  state: SimulationState,
  currentYear: number
): any {
  //find active rebalance events from the state
  const rebalanceEvents = state.events_by_type.rebalance;
  
  if (!rebalanceEvents) {
    return undefined;
  }
  
  //filter active events
  const activeRebalanceEvents = Array.from(rebalanceEvents.values())
    .filter(event => 
      currentYear >= event.start && 
      currentYear < event.start + event.duration
    );
  
  return activeRebalanceEvents.length > 0 ? activeRebalanceEvents[0] : undefined;
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
    if (state.accounts[accountType].has(investmentId)) {
      return state.accounts[accountType].get(investmentId);
    }
  }
  return undefined;
}


export function rebalanceInvestments(
  state: SimulationState,
  scenario: Scenario
): void {
  //get current rebalance event for this year
  const rebalanceEvent = getCurrentRebalanceEvent(state, state.get_current_year());
  
  //no rebalance event is active, do nothing
  if (!rebalanceEvent) {
    return;
  }
  
  //a map of investment IDs to actual investment objects
  const investmentMap = new Map<string, Investment>();
  let commonTaxStatus: TaxStatus | null = null;
  
  // find all investments referenced in the asset allocation and verify common tax status
  for (const investmentId of rebalanceEvent.asset_allocation.keys()) {
    const investment = findInvestment(state, investmentId);
    
    if (!investment) {
      console.warn(`Investment ${investmentId} not found in any account during rebalancing`);
      continue;
    }
    
    // check for common tax status
    if (commonTaxStatus === null) {
      commonTaxStatus = investment.taxStatus;
    } else if (investment.taxStatus !== commonTaxStatus) {
      console.error("All investments in a rebalance event must share the same account tax status");
      return;
    }
    
    investmentMap.set(investmentId, investment);
  }
  
  if (investmentMap.size === 0) {
    console.warn("No valid investments found for rebalancing");
    return;
  }
  
  //the total current value of all investments to be rebalanced
  let totalValue = 0;
  for (const investment of investmentMap.values()) {
    totalValue += investment.get_value();
  }
  
  //determine the target allocation
  let targetAllocation: Map<string, number>;
  
  if (rebalanceEvent.glide_path) {
    //calculate progress along the glide path
    const progress = Math.min(1, (state.get_current_year() - rebalanceEvent.start) / rebalanceEvent.duration);
    
    targetAllocation = new Map();
    
    //interpolate each investment's percentage between initial and final values
    for (const [investmentId, initialPercentage] of rebalanceEvent.asset_allocation.entries()) {
      const finalPercentage = rebalanceEvent.asset_allocation2?.get(investmentId) || initialPercentage;
      const interpolatedPercentage = initialPercentage + (finalPercentage - initialPercentage) * progress;
      targetAllocation.set(investmentId, interpolatedPercentage);
    }
  } else {
    //use the fixed allocation percentages
    targetAllocation = rebalanceEvent.asset_allocation;
  }
  
  //verify that the allocation percentages sum to 100
  const totalPercentage = Array.from(targetAllocation.values()).reduce((sum, percentage) => sum + percentage, 0);
  const epsilon = 0.01; //epsilon for floating point comparison
  
  if (Math.abs(totalPercentage - 100) > epsilon) {
    console.error(`Allocation percentages sum to ${totalPercentage}, not 100. Skipping rebalancing.`);
    return;
  }
  
  //for each investment, calculate target value and perform rebalancing
  for (const [investmentId, targetPercentage] of targetAllocation.entries()) {
    const investment = investmentMap.get(investmentId);
    
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
      if (!investment.is_tax_exempt()) {
        const unrealizedGains = currentValue - investment.get_cost_basis();
        const sellProportion = amountToSell / currentValue;
        const capitalGainLoss = unrealizedGains * sellProportion;
        
        //add to capital gains income
        state.incr_capital_gains_income(capitalGainLoss);
        
        // adjust cost basis proportionally to the amount sold
        investment.incr_cost_basis(-(investment.get_cost_basis() * sellProportion));
      }
    }
  }
}
