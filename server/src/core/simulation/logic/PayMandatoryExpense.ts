// src/core/simulation/PayMandatoryExpense.ts
/**
 * This module handles mandatory expenses and tax payments in the financial simulation.
 * It processes non-discretionary expenses and the previous year's taxes,
 * withdrawing from investments as needed according to the user's strategy.
 * todo: 这个文件可以被优化，因为如果创建了本地的event，那么每年更新的时候，我们都需要重新创建event。
 * todo：最好的方法是在外部创建event，然后在这里使用。
 * todo：我们可以在simulationState中创建一个方法来获取Mandatory Expense event 和 Discretionary Expense event。
 * todo：同时我们也可以在Simulation State中创建一个对象来存储这些event。
 *
 * 我们现在有的Expense event object是：
 *  ExpenseEvent{
 * name: string;
 * start: number;
 * duration: number;
 * type: string;
 * initial_amount: number;
 * change_type: ChangeType;
 * expected_annual_change: RandomGenerator;
 * inflation_adjusted: boolean;
 * user_fraction: number;
 * discretionary: boolean;
 * }
 */

import { simulation_logger } from "../../../utils/logger/logger";
import { ExpenseEvent } from "../../domain/event/ExpenseEvent";
import { cash_investment_one } from "../../domain/raw/investment_raw";
import { TaxStatus } from "../../Enums";
import { SimulationState } from "../SimulationState";

/**
 * Process mandatory expense events and previous year's taxes for the current year
 * ! you should check if return true or false.
 * ! if return true, it means we can continue the simulation.
 * ! if return false, it means we cannot continue the simulation.
 * @param state The current simulation state
 * @returns boolean
 */
export function pay_mandatory_expenses(state: SimulationState): boolean {
  const cur_simulation_year = state.get_current_year();
  const spouse_alive = state.spouse?.is_alive() || false;

  let total_tax = 0;
  // step a to c
  // details are inside
  if (cur_simulation_year !== state.get_start_year()) {
    total_tax = state.process_tax();
  }

  // step d: calculate total amount P = sum of mandatory expense in current year + previous year tax
  let mandatory_expenses = 0;
  state.event_manager
    .get_active_mandatory_event(cur_simulation_year)
    .forEach((event: ExpenseEvent) => {
      let amt = state.event_manager.update_initial_amount(event);
      if (spouse_alive) {
        simulation_logger.debug(`Spouse alive. User own ${event.user_fraction} of the event`);
        amt *= event.user_fraction;
      } else {
        simulation_logger.debug(`Spouse not exist/alive. User own ${event.user_fraction} of the event`);
      }
      mandatory_expenses += amt;
    });
  
  simulation_logger.debug(`total mandatory expenses: ${mandatory_expenses}`);
  const total_amount = mandatory_expenses + total_tax;
  simulation_logger.debug(`total amount we have to pay (including tax): ${mandatory_expenses}`);

  // step e: total withdrawal amount W = P - (amount of cash)
  const withdrawal_amount = Math.max(0, total_amount - state.account_manager.cash.get_value());
  state.account_manager.cash.incr_value(-Math.min(total_amount, state.account_manager.cash.get_value()));

  simulation_logger.debug(`pay mandatory expense withdrawal from non cash investment: ${withdrawal_amount}`);

  // step f:
  // withdrawal from investments to fill withdrawal_amount
  if(withdrawal_amount > 0) {
    const withrawaled = state.process_investment_withdrawal(withdrawal_amount);
    state.event_manager.incr_mandatory_expense(total_amount);
    return withdrawal_amount === withrawaled;
  }
  return true;
}