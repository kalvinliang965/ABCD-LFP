// src/core/simulation/RebalanceInvestments.ts
import { SimulationState } from '../SimulationState';
import { Scenario } from '../../domain/scenario/Scenario';
import { Investment } from '../../domain/investment/Investment';
import { TaxStatus } from '../../Enums';
import { simulation_logger } from '../../../utils/logger/logger';

/*rebalance investments according to event's asset allocation
 *process sales first to calculate capital gains, then purchases
 *ensure all investments are of the same account type
 */
export function rebalance_investments(
	state: SimulationState,
	scenario: Scenario
): void {
	//get current rebalance events for this year
	const rebalance_events = scenario.event_manager.get_active_rebalance_event(state.get_current_year());
	simulation_logger.debug(`${rebalance_events.length} active rebalance events retrieved`);
	
	//if no rebalance events are active, do nothing
	if (rebalance_events.length === 0) {
		return;
	}
	
	//process each active rebalance event
	for (const rebalance_event of rebalance_events) {
		simulation_logger.debug(`Processing rebalance event: ${rebalance_event.name}`);
		
		//get all investments from the asset allocation
		const investment_ids = Array.from(rebalance_event.asset_allocation.keys());
		
		//verify that all investments are of the same account type
		let account_type: TaxStatus | undefined;
		
		//get the first investment's account type
		const first_investment = scenario.account_manager.after_tax.get(investment_ids[0]) || 
		                        scenario.account_manager.non_retirement.get(investment_ids[0]) || 
		                        scenario.account_manager.pre_tax.get(investment_ids[0]);
		
		if (!first_investment) {
			simulation_logger.error(`First investment ${investment_ids[0]} not found in any account type`);
			continue;
		}
		
		account_type = first_investment.taxStatus;
		
		//verify all other investments are in the same account type
		for (const investment_id of investment_ids.slice(1)) {
			const investment = scenario.account_manager.after_tax.get(investment_id) || 
			                  scenario.account_manager.non_retirement.get(investment_id) || 
			                  scenario.account_manager.pre_tax.get(investment_id);
			
			if (!investment || investment.taxStatus !== account_type) {
				simulation_logger.error(`Investment ${investment_id} is not in ${account_type} account type`);
				continue;
			}
		}
		
		//get all investments for this account type
		const investments = new Map<string, Investment>();
		for (const investment_id of investment_ids) {
			const investment = scenario.account_manager.after_tax.get(investment_id) || 
			                   scenario.account_manager.non_retirement.get(investment_id) || 
			                  scenario.account_manager.pre_tax.get(investment_id);
			if (investment && investment.taxStatus === account_type) {
				investments.set(investment_id, investment);
			}
		}
		
		//calculate total value of all investments
		let total_value = 0;
		for (const investment of investments.values()) {
			total_value += investment.get_value();
		}
		simulation_logger.debug(`Total value to rebalance: ${total_value}`);
		
		//verify that the allocation percentages sum to 100
		const total_percentage = Array.from(rebalance_event.asset_allocation.values()).reduce((sum: number, percentage: number) => sum + percentage, 0);
		const epsilon = 0.01; //epsilon for floating-point comparison
		
		if (Math.abs(total_percentage - 1) > epsilon) {
			simulation_logger.warn(`Allocation percentages sum to ${total_percentage}, but should sum to 1`);
			continue;
		}
		
		//calculate target values and process sales first
		const sales = new Map<string, number>();
		const purchases = new Map<string, number>();
		
		for (const [investment_id, percentage] of rebalance_event.asset_allocation.entries()) {
			const investment = investments.get(investment_id);
			if (!investment) continue;
			
			const target_value = total_value * percentage;
			const current_value = investment.get_value();
			const difference = current_value - target_value;
			
			if (difference > 0) {
				//need to sell
				sales.set(investment_id, difference);
			} else if (difference < 0) {
				//need to buy
				purchases.set(investment_id, -difference);
			}
		}
		
		//process all sales first to calculate capital gains
		for (const [investment_id, amount_to_sell] of sales.entries()) {
			const investment = investments.get(investment_id)!;
			const current_value = investment.get_value();
			const cost_basis = investment.get_cost_basis();
			
			//calculate capital gains
			const unrealized_gains = current_value - cost_basis;
			const sell_proportion = amount_to_sell / current_value;
			const capital_gain = unrealized_gains * sell_proportion;
			
			//update investment and cash
			investment.incr_value(-amount_to_sell);
			investment.incr_cost_basis(-cost_basis * sell_proportion);
			state.account_manager.cash.incr_value(amount_to_sell);
			
			//update capital gains income if in non-retirement account
			if (account_type === TaxStatus.NON_RETIREMENT) {
				state.user_tax_data.incr_cur_capital_gains(capital_gain);
			}
			
			simulation_logger.debug(`Sale: ${investment_id} (${account_type}) -> Amount: ${amount_to_sell}, Capital Gain: ${capital_gain}, New Value: ${investment.get_value()}, Cash Balance: ${state.account_manager.cash.get_value()}`);
		}
		
		//process all purchases
		for (const [investment_id, amount_to_buy] of purchases.entries()) {
			const investment = investments.get(investment_id)!;
			
			//update investment and cash
			investment.incr_value(amount_to_buy);
			investment.incr_cost_basis(amount_to_buy);
			state.account_manager.cash.incr_value(-amount_to_buy);
			
			simulation_logger.debug(`Purchase: ${investment_id} (${account_type}) -> Amount: ${amount_to_buy}, New Value: ${investment.get_value()}, Cash Balance: ${state.account_manager.cash.get_value()}`);
		}
	}
}
