// src/core/simulation/PayDiscretionaryExpense.ts
/**
 * This module handles discretionary expenses in the financial simulation.
 * It processes discretionary expenses according to the spending strategy,
 * ensuring that total assets never fall below the financial goal.
 * Unlike mandatory expenses, discretionary expenses can be partially paid
 * or skipped entirely to maintain the financial goal.
 */

import { SimulationState } from "./SimulationState";
import {  withdraw_from_investments, SpendingEvent } from "./ExpenseHelper";

/**
 * Process discretionary expense events for the current year
 * @param state The current simulation state
 * @returns void
 */
export function pay_discretionary_expenses(state: SimulationState): void {
  // SEQUENTIAL THINKING STEP 1: 从Scenario中获取已预处理的自由支出列表
  // 这些支出已经按当前年份进行了筛选，并已经应用了通货膨胀调整
  const discretionaryExpenses = state.get_discretionary_expenses();

  // If no discretionary expenses are active, return early to avoid unnecessary processing
  if (discretionaryExpenses.length === 0) {
    return;
  }

  // SEQUENTIAL THINKING STEP 2: Order discretionary expenses according to the spending strategy
  // This ensures expenses are paid in the user's preferred order of priority
  const orderedExpenses = order_expenses_by_strategy(
    discretionaryExpenses,
    state.spending_strategy || []
  );

  // SEQUENTIAL THINKING STEP 3: Calculate total assets and determine available funds
  // Financial goal represents the minimum assets that must be maintained
  const totalAssets = calculate_total_assets(state);
  const financialGoal = state.get_financial_goal();

  // Available funds is the amount that can be spent while maintaining the financial goal
  let availableFunds = Math.max(0, totalAssets - financialGoal);

  // SEQUENTIAL THINKING STEP 4: Find the cash account for payments
  const cashAccount = state.cash;

  // SEQUENTIAL THINKING STEP 5: Process each discretionary expense in order
  for (const expense of orderedExpenses) {
    // 获取当前年份，用于日志记录
    const currentYear = state.get_current_year();

    // Get the expense amount (SpendingEvent already has the calculated amount property)
    const expenseAmount = expense.amount;

    // If we have enough in cash to cover the expense
    if (cashAccount.get_value() >= expenseAmount) {
      // Pay the full expense amount
      cashAccount.incr_value(-expenseAmount);
      availableFunds -= expenseAmount;
      console.log(
        `Paid discretionary expense: ${expense.name} - $${expenseAmount} in year ${currentYear}`
      );
    } else {
      // SEQUENTIAL THINKING STEP 6: Try to withdraw from investments if cash is insufficient
      // Calculate how much more we need
      const additionalFundsNeeded = expenseAmount - cashAccount.get_value();

      // Check if we can maintain the financial goal if we withdraw funds
      if (availableFunds >= additionalFundsNeeded) {
        // Withdraw funds from investments according to the strategy
        const { withdrawn, unfunded } = withdraw_from_investments(
          state,
          additionalFundsNeeded
        );

        // If we successfully withdrew the full amount needed
        if (unfunded === 0) {
          // Pay the full expense amount
          cashAccount.incr_value(-expenseAmount);
          availableFunds -= expenseAmount;
          console.log(
            `Paid discretionary expense: ${expense.name} - $${expenseAmount} in year ${currentYear} (withdrew $${withdrawn} from investments)`
          );
        } else {
          // We couldn't withdraw enough - pay partial amount
          const partialAmount = cashAccount.get_value() + withdrawn;
          cashAccount.incr_value(-partialAmount);
          availableFunds -= partialAmount;
          console.log(
            `Partially paid discretionary expense: ${expense.name} - $${partialAmount} of $${expenseAmount} in year ${currentYear}`
          );
        }
      } else {
        // SEQUENTIAL THINKING STEP 7: Handle case where we can't maintain financial goal
        // Calculate maximum amount we can spend while maintaining financial goal
        const maxAvailable = Math.min(availableFunds, cashAccount.get_value());

        if (maxAvailable > 0) {
          // Pay partial amount to maintain financial goal
          cashAccount.incr_value(-maxAvailable);
          availableFunds -= maxAvailable;
          console.log(
            `Partially paid discretionary expense: ${expense.name} - $${maxAvailable} of $${expenseAmount} in year ${currentYear} (limited by financial goal)`
          );
        } else {
          // Skip this expense entirely
          console.log(
            `Skipped discretionary expense: ${expense.name} - $${expenseAmount} in year ${currentYear} (insufficient funds while maintaining financial goal)`
          );
        }
      }
    }

    // If we've used up all available funds, stop processing expenses
    if (availableFunds <= 0) {
      console.log(
        `Stopped processing discretionary expenses in year ${currentYear} - financial goal reached`
      );
      break;
    }
  }
}

/**
 * Orders discretionary expenses according to the user's spending strategy
 * @param expenses The list of discretionary expenses to order
 * @param strategy The user's spending strategy (expense priorities)
 * @returns The ordered list of expenses
 */
function order_expenses_by_strategy(
  expenses: SpendingEvent[],
  strategy: string[]
): SpendingEvent[] {
  // If no strategy is defined, return expenses in their original order
  if (!strategy || strategy.length === 0) {
    return expenses;
  }

  // Make a copy to avoid mutating the original array
  const result = [...expenses];

  // Sort expenses based on their position in the strategy array
  // Items earlier in the strategy array have higher priority
  result.sort((a, b) => {
    const priorityA = strategy.indexOf(a.name);
    const priorityB = strategy.indexOf(b.name);

    // Handle case where expense is not in the strategy array
    // Items not in the strategy will be placed at the end
    if (priorityA === -1) return 1;
    if (priorityB === -1) return -1;

    // Sort by priority
    return priorityA - priorityB;
  });

  return result;
}

/**
 * Calculates total assets across all investments
 * @param state The current simulation state
 * @returns The total value of all investments
 */
function calculate_total_assets(state: SimulationState): number {
  let total = 0;

  // Add cash value
  total += state.cash.get_value();

  // Add up all non-retirement accounts
  state.accounts.non_retirement.forEach((account) => {
    total += account.get_value();
  });

  // Add up all pre-tax accounts
  state.accounts.pre_tax.forEach((account) => {
    total += account.get_value();
  });

  // Add up all after-tax accounts
  state.accounts.after_tax.forEach((account) => {
    total += account.get_value();
  });

  return total;
}
