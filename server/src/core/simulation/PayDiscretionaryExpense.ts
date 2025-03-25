// src/core/simulation/PayDiscretionaryExpense.ts
/**
 * This module handles discretionary expenses in the financial simulation.
 * It processes discretionary expenses according to the spending strategy,
 * while ensuring the user's total assets don't fall below the financial goal.
 * 请你仔细研究PayMandatoryExpense，我们现在有一个类似的文件叫做PayDiscretionaryExpense。这个文件的大体需求与PayMandatory一致。你可以通过类似于PayMandatory的方法来获取所必须的参数等。

现在请你更新并实现PayDiscretionaryExpenses。使用sequencial thinking

Pay non-discretionary expenses and the previous year’s taxes, i.e., subtract them from the cash investment.  Perform additional withdrawals if needed to pay them.
Calculate the previous year’s federal and state income tax using the value of curYearIncome and curYearSS from the previous year, and inflation-adjusted federal and state income tax data (rates, brackets, and standard deduction) for the previous year.
Calculate the previous year’s capital gains tax using the value of curYearGains from the previous year, and inflation-adjusted federal capital gains tax data for the previous year. I recommend SmartAsset’s article on capital gains tax  Note that capital gains tax cannot be negative, even if the user has a net loss.  The IRS allows carrying capital losses forward to future years; we ignore this.
Calculate the previous year’s early withdrawal tax, using the value of curYearEarlyWithdrawals from the previous year.
total payment amount P = sum of non-discretionary expenses in the current year plus the previous year’s taxes.  Calculate the amount of expense events in a similar way as calculating the amount of income events.
total withdrawal amount W = P - (amount of cash)
Iterate over investments in the expense withdrawal strategy, selling them one by one, until the total amount sold equals W.  The last investment to be sold might be partially sold.
For each sale, compute the capital gain, and update running total curYearGains of capital gains, if the sold investment’s tax status is not “pre-tax retirement”.  If the entire investment is sold, capital gain = current value - purchase price, where purchase price = sum of the amounts of purchases of this investment plus the initial value at the start of the simulation.  Note that the purchase price must be stored, and updated upon each purchase.  If a fraction f of an investment is sold, then capital gain = f * (current value - purchase price).   
Note that the capital “gain” may be negative (i.e., a loss), and that capital gains tax is paid on the net capital gain for the year.   Note that capital gains in pre-tax retirement accounts are taxed as regular income upon withdrawal from the pre-tax retirement account.
Update running total curYearIncome, if the investment sold is held in a pre-tax retirement account.  This reflects that we are both selling the investment and withdrawing the funds from the pre-tax retirement account in order to pay the expense.
Update running total curYearEarlyWithdrawals, if the investment sold is held in a pre-tax or after-tax retirement account and the user’s age is less than 59.  If the user’s age equals 59, we assume they perform this withdrawal after they turn 59½.


Pay discretionary expenses in the order given by the spending strategy, except stop if continuing would reduce the user’s total assets below the financial goal.  The last discretionary expense to be paid can be partially paid, if incurring the entire expense would violate the financial goal.  Perform additional withdrawals if needed to pay them.
Details are similar to the details of paying non-discretionary expenses.


请你假设payMandatoryExpense 完全正确
 * TODO: need investgate! 
 */

import { SimulationState } from "./SimulationState";
import {
  SpendingEvent,
  withdraw_from_investments,
  calculate_detailed_expense_amount,
} from "./ExpenseHelper";

/**
 * Calculate the total assets across all accounts
 *
 * @param state The simulation state
 * @returns The total value of all assets
 */
function calculate_total_assets(state: SimulationState): number {
  let totalAssets = state.cash.get_value();

  // Add non-retirement accounts
  for (const [_, investment] of state.accounts.non_retirement) {
    totalAssets += investment.get_value();
  }

  // Add pre-tax retirement accounts
  for (const [_, investment] of state.accounts.pre_tax) {
    totalAssets += investment.get_value();
  }

  // Add after-tax retirement accounts
  for (const [_, investment] of state.accounts.after_tax) {
    totalAssets += investment.get_value();
  }

  return totalAssets;
}

/**
 * Sort discretionary expenses according to the spending strategy
 *
 * @param expenses The list of discretionary expenses
 * @param strategy The spending strategy (ordered list of expense names)
 * @returns Sorted list of expenses
 */
function sort_expenses_by_strategy(
  expenses: SpendingEvent[],
  strategy: string[]
): SpendingEvent[] {
  // Create a priority map based on the strategy order
  const priorityMap = new Map<string, number>();

  strategy.forEach((name, index) => {
    priorityMap.set(name, index);
  });

  // Sort expenses by priority
  return [...expenses].sort((a, b) => {
    const priorityA = priorityMap.has(a.name)
      ? priorityMap.get(a.name)!
      : Number.MAX_SAFE_INTEGER;
    const priorityB = priorityMap.has(b.name)
      ? priorityMap.get(b.name)!
      : Number.MAX_SAFE_INTEGER;
    return priorityA - priorityB;
  });
}

/**
 * Process discretionary expense events for the current year, respecting the financial goal
 * ! you should check if return true or false.
 * ! if return true, it means we can continue the simulation.
 * ! if return false, it means we cannot continue the simulation.
 *
 * @param state The current simulation state
 * @returns boolean
 */
export function pay_discretionary_expenses(state: SimulationState): boolean {
  // SEQUENTIAL THINKING STEP 1: Get discretionary expenses for the current year
  const currentYear = state.get_current_year();
  const discretionaryExpenses = state.get_discretionary_expenses();

  // SEQUENTIAL THINKING STEP 2: Sort expenses according to the spending strategy
  const sortedExpenses =
    state.spending_strategy && state.spending_strategy.length > 0
      ? sort_expenses_by_strategy(
          discretionaryExpenses,
          state.spending_strategy
        )
      : discretionaryExpenses;

  // SEQUENTIAL THINKING STEP 3: Calculate current total assets and financial goal
  let totalAssets = calculate_total_assets(state);
  const financialGoal = state.get_financial_goal();

  // SEQUENTIAL THINKING STEP 4: Calculate total discretionary expense amount
  let totalProcessedAmount = 0;

  // SEQUENTIAL THINKING STEP 5: Process each expense in order
  for (const expense of sortedExpenses) {
    // Calculate the expense amount for this year
    const expenseAmount = calculate_detailed_expense_amount(
      expense,
      currentYear,
      state.inflation_factor
    );

    if (expenseAmount <= 0) continue; // Skip zero-amount expenses

    // Check if paying this expense would violate the financial goal
    if (totalAssets - expenseAmount < financialGoal) {
      // Calculate maximum allowable amount to pay partially
      const maxAllowableAmount = Math.max(0, totalAssets - financialGoal);

      if (maxAllowableAmount > 0) {
        // Pay partial amount
        const cashValue = state.cash.get_value();

        if (cashValue >= maxAllowableAmount) {
          // Cash is sufficient for partial payment
          state.cash.incr_value(-maxAllowableAmount);
        } else {
          // Use all available cash first
          state.cash.incr_value(-cashValue);
          const remainingNeeded = maxAllowableAmount - cashValue;

          // Withdraw remaining amount from investments
          const withdrawalResult = withdraw_from_investments(
            state,
            remainingNeeded
          );

          // Update tax-related values
          state.incr_capital_gains_income(withdrawalResult.capitalGain);
          state.incr_ordinary_income(withdrawalResult.cur_year_income);
          state.incr_early_withdrawal_penalty(
            withdrawalResult.early_withdrawal_penalty
          );

          // Check if withdrawal was successful
          if (withdrawalResult.unfunded > 0) {
            return false; // Unable to pay even partial expense
          }
        }
      }

      // Stop processing more expenses after handling partial payment
      return true;
    }

    // SEQUENTIAL THINKING STEP 6: Pay the full expense
    const cashValue = state.cash.get_value();

    if (cashValue >= expenseAmount) {
      // Cash is sufficient, pay directly
      state.cash.incr_value(-expenseAmount);
    } else {
      // Use all available cash first
      state.cash.incr_value(-cashValue);
      const remainingNeeded = expenseAmount - cashValue;

      // Withdraw remaining amount from investments
      const withdrawalResult = withdraw_from_investments(
        state,
        remainingNeeded
      );

      // Update tax-related values
      state.incr_capital_gains_income(withdrawalResult.capitalGain);
      state.incr_ordinary_income(withdrawalResult.cur_year_income);
      state.incr_early_withdrawal_penalty(
        withdrawalResult.early_withdrawal_penalty
      );

      // Check if all expenses were paid
      if (withdrawalResult.unfunded > 0) {
        return false; // Payment failed
      }
    }

    // Update remaining assets
    totalAssets -= expenseAmount;
    totalProcessedAmount += expenseAmount;
  }

  return true;
}
