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
    return state.account_manager.get_net_worth() >= state.get_financial_goal(); 
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
    
    // amount we have to pay
    const full_payment = Math.min(state.event_manager.update_initial_amount(expense_event));
    const partial_payment = Math.min(state.get_financial_goal() - state.account_manager.get_net_worth());
    // WARNING: This shouldnt be negative
    if (partial_payment <= 0) {
      simulation_logger.error("Financial goal is violated incorrectly");
      throw new Error("Financial goal is violated incorrectly");
    }
    const payment = Math.min(full_payment, partial_payment);

    simulation_logger.debug(`Have to pay ${payment}`);
    const withdrawal_amount = Math.min(payment - state.account_manager.cash.get_value(), 0);
  
    const cash_paid = Math.min(payment, state.account_manager.cash.get_value());
    simulation_logger.debug(`Cash paid ${cash_paid}`);
    state.account_manager.cash.incr_value(-cash_paid);
    
    // if we dont have enough mome
    if (withdrawal_amount > 0 && withdrawal_amount !== state.process_investment_withdrawal(withdrawal_amount)) {
      break;
    }
  };

}