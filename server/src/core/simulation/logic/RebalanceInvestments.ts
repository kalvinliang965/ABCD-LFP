// src/core/simulation/RebalanceInvestments.ts
import { SimulationState } from '../SimulationState';
import { Investment } from '../../domain/investment/Investment';
import { TaxStatus } from '../../Enums';
import { simulation_logger } from '../../../utils/logger/logger';
import { RebalanceEventMap } from '../../domain/EventManager';
import { RebalanceEvent } from '../../domain/event/RebalanceEvent';

//function to prune overlapping rebalance events
export function prune_overlapping_rebalance_events(src: RebalanceEventMap): RebalanceEventMap {
	//this will hold only the non-overlapping events
	const kept = new Map<string, RebalanceEvent>();
	//sort by start ascending
	//if two events have the same start, sort them alphabetically
	const ordered = Array.from(src.values())
		.sort((a, b) =>
			a.start !== b.start ? a.start - b.start : a.name.localeCompare(b.name)
		);

	//track the furthest "end year" for each tax status
	const last_end_by_status: Record<TaxStatus, number> = {
		[TaxStatus.NON_RETIREMENT]: -Infinity,
		[TaxStatus.PRE_TAX]: -Infinity,
		[TaxStatus.AFTER_TAX]: -Infinity
	};

	//keep event if it does not start before or at lastEnd for its tax status, skip otherwise
	for (const ev of ordered) {
		//get the first investment's tax status
		const first_investment_id = Array.from(ev.asset_allocation.keys())[0];
		if (!first_investment_id) {
			simulation_logger.warn(`Skipping rebalance event ${ev.name} with no investments`);
			continue;
		}

		//get the tax status from the first investment
		let tax_status: TaxStatus;
		if (first_investment_id.includes('non-retirement')) {
			tax_status = TaxStatus.NON_RETIREMENT;
		}
		else if (first_investment_id.includes('pre-tax') || first_investment_id.includes('retirement')) {
			tax_status = TaxStatus.PRE_TAX;
		}
		else if (first_investment_id.includes('after-tax') || first_investment_id.includes('tax-exempt')) {
			tax_status = TaxStatus.AFTER_TAX;
		}
		else {
			simulation_logger.warn(`Skipping rebalance event ${ev.name} with unknown tax status key '${first_investment_id}'`);
			continue;
		}

		const end = ev.start + ev.duration;
		if (ev.start <= last_end_by_status[tax_status]) {
			//if overlap, then skip
			simulation_logger.warn(
				`skipping overlapping rebalance event ${ev.name} (${ev.start}-${end}) for ${tax_status} account type`
			);
			continue;
		}
		kept.set(ev.name, ev);
		last_end_by_status[tax_status] = end;
	}
	return kept;
}

/*rebalance investments according to event's asset allocation
 *process sales first to calculate capital gains, then purchases
 *ensure all investments are of the same account type
 */
export function run_rebalance_investment(
	state: SimulationState,
): void {
	//get current rebalance events for this year
	const rebalance_events = state.event_manager.get_active_rebalance_event(state.get_current_year());
	simulation_logger.debug(`${rebalance_events.length} active rebalance events retrieved`);
	
	//if no rebalance events are active, do nothing
	if (rebalance_events.length === 0) {
		return;
	}
	
	//process each active rebalance event
	for (const rebalance_event of rebalance_events) {
		simulation_logger.debug(`Processing rebalance event: ${rebalance_event.name}`);
		
		//check for positive cash allocations (fail-fast for user feedback)
		let has_cash_allocation = false;
		for (const [investment_id, percentage] of rebalance_event.asset_allocation.entries()) {
			if (investment_id.toUpperCase().includes('CASH') && percentage > 0) {
				simulation_logger.error(
					`Invalid rebalance-event allocation: cash was given ${(percentage*100).toFixed(1)}%. ` +
					`You must only rebalance non-cash assets.`
				);
				has_cash_allocation = true;
				break;
			}
		}
		
		//skip this event if it has positive cash allocations
		if (has_cash_allocation) {
			simulation_logger.debug(`Skipping rebalance event ${rebalance_event.name} due to cash allocation`);
			continue;
		}
		
		//get all investments from the asset allocation
		const investment_ids = Array.from(rebalance_event.asset_allocation.keys())
			//filter out any cash investments from the list to avoid "not found" errors
			.filter(id => !id.toUpperCase().includes('CASH'));
		
		//skip this rebalance event if no investments remain after filtering
		if (investment_ids.length === 0) {
			simulation_logger.debug(`Skipping rebalance event ${rebalance_event.name} - only cash investments found`);
			continue;
		}
		
		//verify that all investments are of the same account type
		let account_type: TaxStatus | undefined;
		
		//get the first investment's account type
		const first_investment = state.account_manager.after_tax.get(investment_ids[0]) || 
		                        state.account_manager.non_retirement.get(investment_ids[0]) || 
		                        state.account_manager.pre_tax.get(investment_ids[0]);
		if (!first_investment) {
			simulation_logger.error(`First investment ${investment_ids[0]} not found in any account type`);
			continue;
		}
		
		account_type = first_investment.tax_status;
		
		//verify all other investments are in the same account type
		for (const investment_id of investment_ids.slice(1)) {
			const investment = state.account_manager.after_tax.get(investment_id) || 
			                  state.account_manager.non_retirement.get(investment_id) || 
			                  state.account_manager.pre_tax.get(investment_id);

			if (!investment || investment.tax_status !== account_type) {
				simulation_logger.error(
					`Second investment ${investment_id} is not in ${account_type} account type`
				);
				continue;
			}
		}
		
		//get all investments for this account type
		const investments = new Map<string, Investment>();
		for (const investment_id of investment_ids) {
			const investment = state.account_manager.after_tax.get(investment_id) || 
			                   state.account_manager.non_retirement.get(investment_id) || 
			                  state.account_manager.pre_tax.get(investment_id);
			if (investment && investment.tax_status === account_type) {
				investments.set(investment_id, investment);
			}
		}
		
		//calculate total value of all investments
		let total_value = 0;
		for (const investment of investments.values()) {
			total_value += investment.get_value();
		}
		simulation_logger.debug(`Total value to rebalance: ${total_value}`);
		
		//verify that the allocation percentages sum to 100 for non-cash investments
		let total_percentage = 0;
		
		//calculate sum of percentages for non-cash investments
		for (const investment_id of investment_ids) {
			const percentage = rebalance_event.asset_allocation.get(investment_id) || 0;
			total_percentage += percentage;
		}
		
		const epsilon = 0.01; //epsilon for floating-point comparison
		
		if (Math.abs(total_percentage - 1) > epsilon) {
			simulation_logger.warn(`Allocation percentages for non-cash investments sum to ${total_percentage}, but should sum to 1`);
			continue;
		}
		
		//calculate target values and process sales first
		const sales = new Map<string, number>();
		const purchases = new Map<string, number>();
		
		for (const [investment_id, percentage] of rebalance_event.asset_allocation.entries()) {
			//skip cash or zero allocation investments
			if (investment_id.toUpperCase().includes('CASH') || percentage === 0) {
				continue;
			}
			
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
				state.user_tax_data.incr_cur_year_gains(capital_gain);
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
