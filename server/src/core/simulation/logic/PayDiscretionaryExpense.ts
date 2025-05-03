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
  const spouse_alive = state.spouse?.is_alive() || false;

  // warning: I know using get_net_worth here gonna be inefficient, but i will fix get_net_worth later!
  function financial_goal_reach(): boolean {
    const net_worth = state.account_manager.get_net_worth();
    const financial_goal = state.get_financial_goal();

    simulation_logger.debug(`Networth: ${net_worth}, financial goal: ${financial_goal}`);
    return net_worth >= financial_goal; 
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
    let amt = state.event_manager.update_initial_amount(expense_event, state.get_annual_inflation_rate());
    if (spouse_alive) {
      simulation_logger.debug(`Spouse alive. User own ${expense_event.user_fraction} of the event`);
      amt *= expense_event.user_fraction;
    } else {
      simulation_logger.debug(`Spouse not exist/alive. User own ${expense_event.user_fraction} of the event`);
    }

    const full_payment = amt;
    const partial_payment = Math.min(state.account_manager.get_net_worth() - state.get_financial_goal(), full_payment);
    // WARNING: This shouldnt be negative
    if (partial_payment <= 0) {
      simulation_logger.error("Financial goal is violated incorrectly");
      throw new Error("Financial goal is violated incorrectly");
    }
    const payment = Math.min(full_payment, partial_payment); //have to pay that will not exceed the financial goal

    simulation_logger.debug(`discretionary expense without violation: ${payment}`);
    const withdrawal_amount = Math.min(payment - state.account_manager.cash.get_value(), 0);
    

    const cash_paid = Math.min(payment, state.account_manager.cash.get_value());
    simulation_logger.debug(`Cash paid ${cash_paid}`);
    state.event_manager.update_discretionary_expenses(expense_event.name, cash_paid);
    state.account_manager.cash.incr_value(-cash_paid);
    
    if(withdrawal_amount > 0) {
      const withdrawaled = state.process_investment_withdrawal(withdrawal_amount);
      simulation_logger.debug(`pay discretionary expense from non cash investment: ${withdrawaled}`);
      state.event_manager.update_discretionary_expenses(expense_event.name, cash_paid + withdrawal_amount);
      simulation_logger.debug(`Updated discretionary expenses ${expense_event.name} adding withdrawal amt`);
      // if we dont have enough money
      if (withdrawal_amount > 0 && withdrawal_amount !== withdrawaled) {
        break;
      }
    }
  };

}