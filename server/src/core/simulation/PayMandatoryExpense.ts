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
  calculate_early_withdrawal_tax,
  calculate_detailed_expense_amount,
} from "./ExpenseHelper";

/**
 * Process mandatory expense events and previous year's taxes for the current year
 * @param state The current simulation state
 * @returns void
 */
export function pay_mandatory_expenses(state: SimulationState): void {
  // SEQUENTIAL THINKING STEP 1: 获取已预处理的强制性支出列表
  // 这些支出已经按当前年份进行了筛选，并已经应用了通货膨胀调整
  const currentYear = state.get_current_year();
  const mandatoryExpenses = state.get_mandatory_expenses();

  // 如果没有强制性支出，但仍需要处理税款
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
  const totalWithdrawalAmount = Math.max(0, totalMandatoryExpenseAmount - cashValue);

  //? 只差这一个不确定是否正确了！
  // SEQUENTIAL THINKING STEP 6: Withdraw funds if needed based on withdrawal strategy
  let earlyWithdrawals = 0;
  if (totalWithdrawalAmount > 0) {
    const withdrawalResult = withdraw_from_investments(
      state,
      totalWithdrawalAmount
    );
    earlyWithdrawals = withdrawalResult.earlyWithdrawals;

    // Log any unfunded amount
    if (withdrawalResult.unfunded > 0) {
      console.warn(
        `Insufficient funds to cover mandatory expenses: $${withdrawalResult.unfunded} short`
      );
    }
  }

  // SEQUENTIAL THINKING STEP 7: Pay expenses and taxes by deducting from cash
  state.cash.incr_value(-totalMandatoryExpenseAmount);
  //我不认为需要reporting，如果经过这一步后 cash为负数，那么就意味着我们没有足够的钱来支付强制性支出那么就代表着我们破产了，直接归零就好了。
}
