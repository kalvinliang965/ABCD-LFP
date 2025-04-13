// src/core/simulation/PayDiscretionaryExpense.ts

import { SimulationState } from "../SimulationState";
import { TaxStatus } from "../../Enums";
import { simulation_logger } from "../../../utils/logger/logger";
import { is_event_active } from "../../domain/EventManager";

/**
 * Process discretionary expense events for the current year, respecting the financial goal
 * ! 这里不再返回true或者false，而是直接修改state，因为我们完全可以不支付任何discretionary expense。
 *! 我们在这里假定拿到的discretionaryExpenses是已经按照spending strategy排序好的。
 * @param state The current simulation state
 * @returns void
 */
export function pay_discretionary_expenses(state: SimulationState): void {
  const current_year = state.get_current_year();
  

  // warning: I know using get_net_worth here gonna be inefficient, but i will fix get_net_worth later!
  function financial_goal_reach(): boolean {
   return state.account_manager.get_net_worth() < state.get_financial_goal(); 
  }

  if (!financial_goal_reach()) {
    simulation_logger.debug(`net_worth: ${state.account_manager.get_net_worth()}, financial: ${state.get_financial_goal()}`);
    return;
  }

  const expense_events = state.event_manager.expense_event;
  for (let i = 0; i < state.spending_strategy.length && financial_goal_reach(); ++i) {
    const expense: string = state.spending_strategy[i];
    if (!expense_events.has(expense)) {
      simulation_logger.error(`"${expense}" from spending strategy does not exist`);
      throw new Error(`"${expense}" from spending strategy does not exist`);
    }
    const expense_event = expense_events.get(expense)!;
    // event not active we skip!
    if (!is_event_active(expense_event, current_year)) {
      continue
    }

    simulation_logger.debug(`Paying for discretionary expense ${expense}`);
    // amount we have to paid
    const payment = state.event_manager.update_initial_amount(expense_event);
    simulation_logger.debug(`Have to pay ${payment}`);
    const withdrawal_amount = payment - state.account_manager.cash.get_value();
    const cash_paid = Math.min(payment, state.account_manager.cash.get_value());
    simulation_logger.debug(`Cash paid ${cash_paid}`);
    state.account_manager.cash.incr_value(-cash_paid);
    
    let withdrawaled=0;
    const investments = state.account_manager.all;
    for (const inv_id of state.expense_withrawal_strategy) {
      // withdrawaled enough money
      if (withdrawaled > withdrawal_amount) {
        break;
      }

      if (!investments.has(inv_id)) {
        simulation_logger.error(`Investment "${inv_id}" does not exist`);
        throw new Error(`Investment "${inv_id}" does not exist`)
      }
      const investment = investments.get(inv_id)!;
      const purchase_price = investment.get_cost_basis();
      simulation_logger.debug(`Planning to sell investment: ${inv_id}`, {
        purchase_price,
        tax_status: investment.tax_status,
      })
      simulation_logger.debug(`${withdrawal_amount - withdrawaled} left`);
      
      // we are withdrawing amount needed to reach
      const going_to_withdraw = Math.min(withdrawal_amount - withdrawaled, purchase_price);

      simulation_logger.debug(`going to withdraw ${going_to_withdraw} from ${inv_id}`);
      investment.incr_cost_basis(-going_to_withdraw);

      if (investment.tax_status != TaxStatus.PRE_TAX) {
        const fraction = (going_to_withdraw / investment.get_cost_basis());
        const gains = investment.get_value() - investment.get_cost_basis();
        const capital_gains = fraction * gains;
        state.user_tax_data.incr_cur_year_gains(capital_gains);
      } 
      
      if (investment.tax_status === TaxStatus.PRE_TAX) {
        state.user_tax_data.incr_cur_year_income(going_to_withdraw);
      }
      
      if (
        state.user.get_age() < 59 && (
          investment.tax_status === TaxStatus.PRE_TAX || 
          investment.tax_status === TaxStatus.AFTER_TAX
      )) {
        state.user_tax_data.incr_year_early_withdrawal(going_to_withdraw);
      }

      withdrawaled += going_to_withdraw;
      simulation_logger.debug(`recieved ${going_to_withdraw} from selling ${investment.id}`)
      simulation_logger.debug(`total withdrawaled: ${withdrawaled}`);
    }
  };

}