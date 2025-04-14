import { SimulationState } from '../SimulationState';
import { Scenario } from '../../domain/scenario/Scenario';
import { Investment } from '../../domain/investment/Investment';
import { simulation_logger } from '../../../utils/logger/logger';

/* investing excess cash according to event's asset allocation
 * after-tax contributions do not exceed the inflation-adjusted limit
 */
export function invest_excess_cash(
	state: SimulationState,
): void {
	//get current invest events for this year
	const invest_events = state.event_manager.get_active_invest_event(state.get_current_year());
	simulation_logger.debug(`${invest_events.length} active invest events retrieved`);
	
	//if no investment events are active, do nothing
	if (invest_events.length === 0) {
		return;
	}
	
	//process each active invest event
	for (const invest_event of invest_events) {
		simulation_logger.debug(`Processing invest event: ${invest_event.name}`);
		
		//calculate excess cash above the maximum cash threshold
		const cash_account = state.account_manager.cash;
		const excess_cash = cash_account.get_value() - invest_event.max_cash;
		simulation_logger.debug(`Excess cash: ${excess_cash}`);
		
		//if no excess cash, do nothing
		if (excess_cash <= 0) {
			simulation_logger.debug('No excess cash to invest');
			continue;
		}
		
		//determine the asset allocation to use
		let allocation: Map<string, number>;
		
		if (invest_event.glide_path) {
			//calculate progress along the glide path (from 0 to 1)
			const progress = Math.min(1, (state.get_current_year() - invest_event.start) / invest_event.duration);
			simulation_logger.debug(`Glide path progress: ${progress}`);
			allocation = new Map();
			
			//interpolate each investment's percentage between initial and final values
			for (const [investment_id, initial_percentage] of invest_event.asset_allocation.entries()) {
				const final_percentage = invest_event.asset_allocation2?.get(investment_id) || initial_percentage;
				const interpolated_percentage = initial_percentage + (final_percentage - initial_percentage) * progress;
				allocation.set(investment_id, interpolated_percentage);
			}
		} else {
			//use the fixed allocation percentages
			allocation = invest_event.asset_allocation;
		}
		
		//verify that the allocation percentages sum to 100
		const total_percentage = Array.from(allocation.values()).reduce((sum, percentage) => sum + percentage, 0);
		const epsilon = 0.01; //epsilon for floating-point comparison
		
		if (Math.abs(total_percentage - 1) > epsilon) {
			simulation_logger.warn(`Allocation percentages sum to ${total_percentage}, but should sum to 1`);
			continue;
		}
		//calculate how much cash we are planning to invest for each investement
		//and classify them by acc type
		let after_tax_total = 0;
		let non_retirement_total = 0;
		const planned_amounts = new Map<string, number>();

		for (const [investment_id, percentage] of allocation.entries()) {
			if (percentage <= 0 || percentage > 1) {
				simulation_logger.error(`Incorrect percentage ${percentage} for investment ${investment_id}`);
				process.exit(1);
			}

			const planned_amount = excess_cash * percentage;
			planned_amounts.set(investment_id, planned_amount);
			//determine account type and add to its own total
			if (state.account_manager.after_tax.has(investment_id)) {
				after_tax_total += planned_amount;
			} else if (state.account_manager.non_retirement.has(investment_id)) {
				non_retirement_total += planned_amount;
			}
		}

		simulation_logger.debug(`Planned fter-tax total: ${after_tax_total}, planned non-retirement total: ${non_retirement_total}`);

		//for after tax account we check if it exceeds inflation adjusted limits
		//if it does, we scale down after-tax amounts to limit, then reallocate difference into non-retirement investments
		if (after_tax_total > state.get_after_tax_contribution_limit()){
			simulation_logger.debug(`After-tax contributions (${after_tax_total}) exceed limit (${state.get_after_tax_contribution_limit()})`);
			
			//compute scaling factors for after-tax
			const after_tax_scale = state.get_after_tax_contribution_limit() / after_tax_total; 
			let non_retirement_scale = 1; //default

			if (non_retirement_total > 0){
				non_retirement_scale = (excess_cash - state.get_after_tax_contribution_limit()) / non_retirement_total; //scale up
				simulation_logger.debug(`Scaling factors-> After-tax: ${after_tax_scale}, Non-retirement: ${non_retirement_scale}`);
			} else {
				simulation_logger.warn('No non-retirement investments, skip scaling for non-retirement allocations');
			}

			//apply scaling factors
			for (const [investment_id, planned_amount] of planned_amounts.entries()) {
				if (state.account_manager.after_tax.has(investment_id)) {
					planned_amounts.set(investment_id, planned_amount * after_tax_scale);
				} else if (state.account_manager.non_retirement.has(investment_id)) {
					planned_amounts.set(investment_id, planned_amount * non_retirement_scale);
				}
			}
		}
		
		//allocate the excess cash among the selected investments
		for (const [investment_id, amount_to_invest] of planned_amounts.entries()) {
			//find the investment in allowed accounts
			let investment: Investment | undefined;
			if (state.account_manager.after_tax.has(investment_id)) {
				investment = state.account_manager.after_tax.get(investment_id);
			} else if (state.account_manager.non_retirement.has(investment_id)) {
				investment = state.account_manager.non_retirement.get(investment_id);
			}
			
			if (!investment) {
				simulation_logger.warn(`Investment ${investment_id} not found in non pre-tax accounts`);
				continue;
			}
			
			//update the investment value and cash balance
			investment.incr_value(amount_to_invest);
			investment.incr_cost_basis(amount_to_invest);
			cash_account.incr_value(-amount_to_invest);
			simulation_logger.debug(`Investment: ${investment_id} (${state.account_manager.after_tax.has(investment_id) ? 'after-tax' : 'non-retirement'}) -> Amount: ${amount_to_invest}, New Value: ${investment.get_value()}, Cash Balance: ${cash_account.get_value()}`);
		}
	}
}


