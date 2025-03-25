/**
 * ExpenseHelper.ts
 *
 * This module provides helper functions for processing expense events in the financial simulation.
 * It centralizes common operations on expense events to avoid code duplication between
 * PayMandatoryExpense and PayDiscretionaryExpense modules.
 *  * 我们现在有的Expense event object是：
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
import { ExpenseEvent } from "../domain/event/ExpenseEvent";
import { ChangeType, IncomeType, TaxStatus } from "../Enums";
import { Investment } from "../domain/investment/Investment";

// Result interface for expense calculation
export interface SpendingEvent extends ExpenseEvent {
  amount: number;
}

/**
 * Checks if an event is active in the specified year
 *
 * @param event The event to check
 * @param current_year The year to check against
 * @returns True if the event is active in the specified year
 */
export function is_event_active(
  event: ExpenseEvent,
  current_year: number
): boolean {
  return (
    current_year >= event.start && current_year < event.start + event.duration
  );
}

/**
 * Filters events to get only mandatory (non-discretionary) expenses that are active in the current year
 * 这个函数会给我们所有在这一年里面必须的events。
 * @param state The simulation state
 * @returns Array of mandatory expense events with their calculated amounts
 */
export function get_mandatory_expenses(
  state: SimulationState
): SpendingEvent[] {
  const mandatoryExpenses: SpendingEvent[] = [];

  for (const [_, event] of state.events_by_type.expense) {
    const expenseEvent = event as ExpenseEvent;
    if (!expenseEvent.discretionary) {
      // 根据是否需要通货膨胀调整来计算金额
      if (expenseEvent.inflation_adjusted) {
        const expenseCalculationResult: SpendingEvent = {
          ...expenseEvent,
          amount: expenseEvent.initial_amount * (1 + state.inflation_factor),
        };
        mandatoryExpenses.push(expenseCalculationResult);
      } else {
        const expenseCalculationResult: SpendingEvent = {
          ...expenseEvent,
          amount: expenseEvent.initial_amount,
        };
        mandatoryExpenses.push(expenseCalculationResult);
      }
    }
  }

  return mandatoryExpenses;
}

/**
 * Filters events to get only discretionary expenses that are active in the current year
 * 这个函数会给我们所有在这一年里面 discretionary 的events。
 * @param state The simulation state
 * @returns Array of discretionary expense events with their calculated amounts
 */
export function get_discretionary_expenses(
  state: SimulationState
): SpendingEvent[] {
  const discretionaryExpenses: SpendingEvent[] = [];

  for (const [_, event] of state.events_by_type.expense) {
    const expenseEvent = event as ExpenseEvent;
    if (expenseEvent.discretionary) {
      // 根据是否需要通货膨胀调整来计算金额
      if (expenseEvent.inflation_adjusted) {
        const expenseCalculationResult: SpendingEvent = {
          ...expenseEvent,
          amount: expenseEvent.initial_amount * state.inflation_factor,
        };
        discretionaryExpenses.push(expenseCalculationResult);
      } else {
        const expenseCalculationResult: SpendingEvent = {
          ...expenseEvent,
          amount: expenseEvent.initial_amount,
        };
        discretionaryExpenses.push(expenseCalculationResult);
      }
    }
  }

  return discretionaryExpenses;
}

/**
 * 计算给定expense在当前年份的金额，考虑通货膨胀调整
 * 应该是正确的了，因为expect_annual_change已经只在乎增长的值而不是初始+增长
 *
 * @param event The expense event
 * @param currentYear The current simulation year
 * @param inflationFactor The cumulative inflation factor
 * @returns The calculated amount for the current year, or 0 if event is not active
 */
export function calculate_detailed_expense_amount(
  event: SpendingEvent,
  currentYear: number,
  inflationFactor: number
): number {
  // 计算基础金额（根据通货膨胀调整）
  let amount = event.inflation_adjusted
    ? event.initial_amount * inflationFactor
    : event.initial_amount;

  // 检查事件是否活跃
  if (!is_event_active(event, currentYear)) {
    // 如果事件不活跃，将计算的金额保存在event.amount中，但返回0
    event.amount = amount;
    return 0;
  }

  //此时的事件应该是活跃的，所以需要计算每年的变化
  if (event.change_type === ChangeType.FIXED) {
    //!固定金额变化，如果需要通货膨胀调整也应用到变化金额
    //? 可能计算了两次本金、
    //! 当前并没有计算inflation factor对于增长金额的影响
    let changeAmount = event.expected_annual_change.sample();
    if (event.inflation_adjusted) {
      changeAmount *= inflationFactor;
    }
    event.amount = amount + changeAmount;
  } else if (event.change_type === ChangeType.PERCENTAGE) {
    //!百分比变化，如果需要通货膨胀调整也应用到变化金额
    amount *= 1 + event.expected_annual_change.sample();
    if (event.inflation_adjusted) {
      amount *= inflationFactor;
    }
    event.amount = amount;
  }

  return amount;
}

/**
 * Withdraw funds from investments according to the expense withdrawal strategy
 *
 * @param state The simulation state
 * @param amountNeeded The amount that needs to be withdrawn
 * @returns Information about the withdrawal including capital gains, income, and unfunded amount
 */
export function withdraw_from_investments(
  state: SimulationState,
  amountNeeded: number
): {
  unfunded: number;
  capitalGain: number;
  cur_year_income: number;
  early_withdrawal_penalty: number;
} {
  let remainingAmount = amountNeeded;
  let totalCapitalGain = 0;
  let totalIncome = 0;
  let early_withdrawal_penalty = 0;

  // Go through the withdrawal strategy in order
  for (const investmentId of state.expense_withrawal_strategy || []) {
    if (remainingAmount <= 0) break;

    // Look for the investment in all account types
    let investment: Investment | undefined;
    let accountType: TaxStatus | undefined;

    // Check each account type
    for (const type of [
      TaxStatus.NON_RETIREMENT,
      TaxStatus.PRE_TAX,
      TaxStatus.AFTER_TAX,
    ] as const) {
      let accountMap: Map<string, Investment>;
      switch (type) {
        case TaxStatus.NON_RETIREMENT:
          accountMap = state.accounts.non_retirement;
          break;
        case TaxStatus.PRE_TAX:
          accountMap = state.accounts.pre_tax;
          break;
        case TaxStatus.AFTER_TAX:
          accountMap = state.accounts.after_tax;
          break;
      }

      const account = accountMap.get(investmentId);
      if (account) {
        investment = account;
        accountType = type;
        break;
      }
    }

    // Skip if investment not found, is cash, or no account type determined
    if (!investment || investment === state.cash || !accountType) continue;

    // Get the current value and purchase price of the investment
    //这一部分是用来计算capital gain的
    const currentValue = investment.get_value();
    const purchasePrice = investment.get_cost_basis?.() || 0;

    // Calculate how much to withdraw from this investment
    const amountToWithdraw = Math.min(currentValue, remainingAmount);
    if (amountToWithdraw <= 0) continue;

    // Calculate the fraction of the investment being sold
    const fraction = amountToWithdraw / currentValue;

    // Handle tax implications based on the account type
    if (accountType === TaxStatus.NON_RETIREMENT) {
      // For non-retirement accounts, calculate capital gains
      //! capital gain cannot be negative
      const capitalGain = Math.max(
        amountToWithdraw - fraction * purchasePrice, //提取金额 - fraction * 成本价
        0
      );
      totalCapitalGain += capitalGain; // Add to running total of capital gains
      //! 成本价不会因为卖出而改变
    } else if (accountType === TaxStatus.PRE_TAX) {
      // For pre-tax accounts, the entire withdrawal counts as ordinary income
      totalIncome += amountToWithdraw; // Add to running total of income
    }

    // Check for early withdrawal penalties (before age 59.5)
    if (
      (accountType === TaxStatus.PRE_TAX ||
        accountType === TaxStatus.AFTER_TAX) &&
      state.user.get_age() < 60
    ) {
      // Track early withdrawals
      early_withdrawal_penalty += amountToWithdraw * 0.1;
    }

    // Withdraw the funds
    investment.incr_value(-amountToWithdraw);
    remainingAmount -= amountToWithdraw;
  }

  // Return information about the withdrawal
  // ?你有没有可能支付多余你需要的？
  return {
    unfunded: remainingAmount > 0 ? remainingAmount : 0,
    capitalGain: totalCapitalGain,
    cur_year_income: totalIncome,
    early_withdrawal_penalty: early_withdrawal_penalty,
  };
}
