// src/core/simulations/InvestExcessCash

import { SimulationState } from '../SimulationState';
import { Scenario } from '../../domain/scenario/Scenario';
import { Investment } from '../../domain/investment/Investment';
import { simulation_logger } from '../../../utils/logger/logger';

//get current invest event for the given year
function getCurrentInvestEvent(
	state: SimulationState,
	currentYear: number
): any {
	//find active invest events from the state
	const investEvents = state.events_by_type.invest;
	
	if (!investEvents) {
		return undefined;
	}
	
	//filter active events
	const activeInvestEvents = Array.from(investEvents.values())
		.filter(event => 
			currentYear >= event.start && 
			currentYear < event.start + event.duration
		);
	
	return activeInvestEvents.length > 0 ? activeInvestEvents[0] : undefined;
}

//find investment in one of the allowed account types
function findInvestmentInAccount(
	state: SimulationState,
	investmentId: string,
	allowedAccounts: string[]
): Investment | undefined {
	for (const accountType of allowedAccounts) {
		let accountMap;
		if (accountType == 'non_retirement')
			accountMap = state.account_manager.non_retirement;
		else if (accountType == "after_tax")
			accountMap = state.account_manager.after_tax;
		else {
			console.error("Invalid account type", accountType);
			process.exit(1);
		}
		if (accountMap.has(investmentId)) { 
			return accountMap.get(investmentId);
		}
	}
	return undefined;
}


//process investment of excess cash based on the investment strategy
export function investExcessCash(
	state: SimulationState,
	scenario: Scenario
): void {

	//get current invest event for this year

	const investEvent = getCurrentInvestEvent(state, state.get_current_year());
	
	//if no investment event is active, do nothing
	if (!investEvent) {
		return;
	}
	
	//calculate excess cash above the maximum cash threshold
	const excessCash = state.cash.get_value() - investEvent.max_cash;
	//if no excess cash, do nothing
	if (excessCash <= 0) {
		return;
	}
	
	//determine the asset allocation to use
	let allocation: Map<string, number>;
	
	if (investEvent.glide_path) {
		//calculate progress along the glide path (from 0 to 1)
		const progress = Math.min(1, (state.get_current_year() - investEvent.start) / investEvent.duration);
		
		allocation = new Map();
		
		// Interpolate each investment's percentage between initial and final values
		for (const [investmentId, initialPercentage] of investEvent.asset_allocation.entries()) {
			const finalPercentage = investEvent.asset_allocation2?.get(investmentId) || initialPercentage;
			const interpolatedPercentage = initialPercentage + (finalPercentage - initialPercentage) * progress;
			allocation.set(investmentId, interpolatedPercentage);
		}
	} else {
		//use the fixed allocation percentages
		allocation = investEvent.asset_allocation;
	}
	
	//verify that the allocation percentages sum to 100
	const totalPercentage = Array.from(allocation.values()).reduce((sum, percentage) => sum + percentage, 0);
	const epsilon = 0.01; //epsilon for floating-point comparison
	
	if (Math.abs(totalPercentage - 100) > epsilon) {
		console.warn(`Allocation percentages sum to ${totalPercentage}, but should to 100`);
		return;
	}
	
	// allowed accounts for investments
	const allowedAccounts = ['non_retirement', 'after_tax'];
	
	// Allocate the excess cash among the selected investments
	for (const [investmentId, percentage] of allocation.entries()) {
		if (percentage <= 0 || percentage > 1) {
			console.log("Incorrect percentage");
			process.exit(1);
		}
		//find the investment in allowed accounts
		const investment = findInvestmentInAccount(state, investmentId, allowedAccounts);
		
		if (!investment) {
			console.warn(`Investment ${investmentId} not found in non pre-tax accounts`);
			continue;
		}
		
		//calculate the amount to invest based on the allocation percentage
		const amountToInvest = excessCash * (percentage / 100);
		
		//update the investment value and cash balance
		investment.incr_value(amountToInvest);
		investment.incr_cost_basis(amountToInvest);
		state.cash.incr_value(-amountToInvest);
	}
}


