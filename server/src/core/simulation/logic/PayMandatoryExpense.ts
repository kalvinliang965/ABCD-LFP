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
    .forEach((event: ExpenseEvent) => mandatory_expenses += state.event_manager.update_initial_amount(event));
  
  simulation_logger.debug(`total mandatory expenses: ${mandatory_expenses}`);
  const total_amount = mandatory_expenses + total_tax;
  simulation_logger.debug(`total amount we have to pay (including tax): ${mandatory_expenses}`);

  // step e: total withdrawal amount W = P - (amount of cash)
  const withdrawal_amount = total_amount - state.account_manager.cash.get_value();
  state.account_manager.cash.incr_value(-Math.min(total_amount, state.account_manager.cash.get_value()));

  simulation_logger.debug(`withdrawal amount: ${withdrawal_amount}`);

  // step f:
  // get active mandatory expense
  let withdrawaled=0;
  const investments = state.account_manager.all;
  for (const inv_id of state.expense_withrawal_strategy) {
    // withdrawaled enough money
    if (withdrawaled > withdrawal_amount) {
      return true;
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

    // step) f.i
    // not pre tax retirement accont
    // we have to calculate capital gains
    if (investment.tax_status != TaxStatus.PRE_TAX) {
      const fraction = (going_to_withdraw / investment.get_cost_basis());
      const gains = investment.get_value() - investment.get_cost_basis();
      const capital_gains = fraction * gains;
      state.user_tax_data.incr_cur_year_gains(capital_gains);
    } 
    
    if (investment.tax_status === TaxStatus.PRE_TAX) {
      state.user_tax_data.incr_cur_year_income(going_to_withdraw);
    }
    
    // update withrawal
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

  return false;
}