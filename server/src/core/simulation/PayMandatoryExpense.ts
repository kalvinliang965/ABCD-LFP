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

import { SimulationState } from "./SimulationState";
import {
  withdraw_from_investments,
  calculate_detailed_expense_amount,
} from "./ExpenseHelper";

/**
 * Process mandatory expense events and previous year's taxes for the current year
 * ! you should check if return true or false.
 * ! if return true, it means we can continue the simulation.
 * ! if return false, it means we cannot continue the simulation.
 * @param state The current simulation state
 * @returns boolean
 */
export function pay_mandatory_expenses(state: SimulationState): boolean {
  // SEQUENTIAL THINKING STEP 1: 获取已预处理的强制性支出列表
  // 这些支出已经按当前年份进行了筛选，并已经应用了通货膨胀调整
  const currentYear = state.get_current_year();
  const mandatoryExpenses = state.mandatory_expenses;

  // totalMandatoryExpenseAmount 是所有强制性支出的总和
  let totalMandatoryExpenseAmount = 0;

  // 处理强制性支出
  for (const expense of mandatoryExpenses) {
    totalMandatoryExpenseAmount += calculate_detailed_expense_amount(
      expense,
      currentYear,
      state.inflation_factor
    );
  }

  // SEQUENTIAL THINKING STEP 5: Check if additional withdrawals are needed
  //因为cash已经算好了 - tax后的价格，所以我们按道理来说不应该再去计算tax，直接用cashValue - totalMandatoryExpenseAmount
  const cashValue = state.cash.get_value();
  const totalWithdrawalAmount = Math.max(
    0,
    totalMandatoryExpenseAmount - cashValue
  );
  //如果我们的cash可以cover所有强制性支出，那么我们就不需要再进行任何操作
  //更新cash的value
  if (totalWithdrawalAmount == 0) {
    state.cash.incr_value(-totalMandatoryExpenseAmount);
    return true;
  } else {
    // 我们的钱不够cover，所以需要从其他地方获取资金
    //同时我们要清空cash的value
    state.cash.incr_value(-cashValue);
    const withdrawalResult = withdraw_from_investments(
      state,
      totalWithdrawalAmount
    );

    state.incr_capital_gains_income(withdrawalResult.capitalGain);
    state.incr_ordinary_income(withdrawalResult.cur_year_income);
    state.incr_early_withdrawal_penalty(
      withdrawalResult.early_withdrawal_penalty
    );
    //在这种情况下，我们无论如何都会更新capital_gains_income和ordinary_income还有early_withdrawal_penalty| 但是否破产取决于unfunded是否为0
    return withdrawalResult.unfunded == 0;
  }
}
