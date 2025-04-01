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
import { Event } from "../domain/event/Event";

// Result interface for expense calculation
export interface SpendingEvent extends ExpenseEvent {
  amount: number;
  remaining_amount: number;
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
 * 这个函数会给我们所有在events。
 * @param events Array of events to filter
 * @returns Array of mandatory expense events with their calculated amounts
 */
export function get_mandatory_expenses(events: Event[]): SpendingEvent[] {
  const mandatoryExpenses: SpendingEvent[] = [];

  for (const event of events) {
    // Only process expense type events and check if they are non-discretionary
    if (event.type === "expense") {
      // Type guard to safely handle ExpenseEvent properties
      const expenseEvent = event as ExpenseEvent;
      if (!expenseEvent.discretionary) {
        // 根据是否需要通货膨胀调整来计算金额
        const expenseCalculationResult: SpendingEvent = {
          ...expenseEvent,
          amount: expenseEvent.initial_amount,
          remaining_amount: expenseEvent.initial_amount,
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
 * @param events Array of events to filter
 * @returns Array of discretionary expense events with their calculated amounts
 */
export function get_discretionary_expenses(events: Event[]): SpendingEvent[] {
  const discretionaryExpenses: SpendingEvent[] = [];

  for (const event of events) {
    // Only process expense type events and check if they are discretionary
    if (event.type === "expense") {
      // Type guard to safely handle ExpenseEvent properties
      const expenseEvent = event as ExpenseEvent;
      if (expenseEvent.discretionary) {
        const expenseCalculationResult: SpendingEvent = {
          ...expenseEvent,
          amount: expenseEvent.initial_amount,
          remaining_amount: expenseEvent.initial_amount,
        };
        discretionaryExpenses.push(expenseCalculationResult);
      }
    }
  }

  return discretionaryExpenses;
}

//这个方法更新出来的amount只会计算inflation_adjusted的值，不会计算change_type的值
//!这个函数每年只会被调用一次，调用完后amount中存储的值是当前年份的值
//正确了！
export function update_expense_amount(
  event: SpendingEvent,
  currentYear: number,
  inflationFactor: number
): void {
  let amount = event.inflation_adjusted
    ? event.initial_amount * (1 + inflationFactor)
    : event.initial_amount;

  event.amount = amount;

  //如果今年这个事件是active的，那么就更新amount
  if (is_event_active(event, currentYear)) {
    if (event.change_type === ChangeType.FIXED ) {
      //!固定金额变化，如果需要通货膨胀调整也应用到变化金额
      //! 当前并没有计算inflation factor对于增长金额的影响
      let changeAmount = event.expected_annual_change.sample();
      if (event.inflation_adjusted) {
        changeAmount *= 1+inflationFactor;
      }
      event.amount = amount + changeAmount;
    } else if (event.change_type === ChangeType.PERCENTAGE) {
      //!百分比变化，如果需要通货膨胀调整也应用到变化金额
      amount *= 1 + event.expected_annual_change.sample();
      if (event.inflation_adjusted) {
        amount *= 1 + inflationFactor;
      }
      event.amount = amount;
    }
  }
}

/**
 * 计算给定expense在当前年份的金额，考虑通货膨胀调整
 * 应该是正确的了，因为expect_annual_change已经只在乎增长的值而不是初始+增长
 * 这个function只会计算一个event的金额，不会计算所有event的金额
 * !需要拆分成为update_expense_amount和calculate_detailed_expense_amount
 *
 * @param event The expense event
 * @param currentYear The current simulation year
 * @param inflationFactor The cumulative inflation factor
 * @returns The calculated amount for the current year, or 0 if event is not active
 */
export function calculate_detailed_expense_amount(
  event: SpendingEvent,
  currentYear: number,
): number {
  let amount = event.amount;

  if (!is_event_active(event, currentYear)) {
    return 0;
  }

  return amount * event.user_fraction;
}

/**
 * 排列所有的discretionary expense，按照spending strategy的顺序
 * ! 这个function当前还没有被simulation调用。
 * @param expenses The list of discretionary expenses
 * @param strategy The spending strategy (ordered list of expense names)
 * @returns Sorted list of expenses
 */
export function sort_expenses_by_strategy(
  expenses: SpendingEvent[],
  strategy: string[]
): SpendingEvent[] {
  const priorityMap = new Map<string, number>();

  strategy.forEach((name, index) => {
    priorityMap.set(name, index);
  });

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
} {
  let remainingAmount = amountNeeded;

  // Go through the withdrawal strategy in order
  for (const investmentId of state.expense_withrawal_strategy || []) {
    if (remainingAmount <= 0) break;

    console.log("我们正在处理investmentId", investmentId);
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
      console.log("account", account);
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
    console.log("此时currentValue", currentValue);
    console.log("此时remainingAmount", remainingAmount);
    const amountToWithdraw = Math.min(currentValue, remainingAmount);
    remainingAmount -= amountToWithdraw;
    if (amountToWithdraw <= 0) continue; //这表示从这个账户下拿不出钱
    console.log("我们需要取出amountToWithdraw", amountToWithdraw);

    // Calculate the fraction of the investment being sold
    const fraction = amountToWithdraw / currentValue;
    console.log("计算我这个用户需要掏出fraction", fraction);

    console.log("此时accountType", accountType);
    //我们希望是non-retirement account

    // Handle tax implications based on the account type
    if (accountType === TaxStatus.NON_RETIREMENT) {
      // For non-retirement accounts, calculate capital gains
      //! capital gain cannot be negative

      //此时的fraction * purchasePrice 是用户实际掏出的钱
      console.log("此时fraction", fraction);
      console.log("此时的currentValue 是", currentValue);
      console.log("此时的purchasePrice 是", purchasePrice);
      console.log(
        "fraction * (currentValue - purchasePrice)",
        fraction * (currentValue - purchasePrice)
      );
      //计算capital gain的公式是 sold fraction * （currentValue - purchasePrice）
      const capitalGain = Math.max(
        fraction * (currentValue - purchasePrice), //提取金额 - fraction * 成本价
        0
      );

      console.log("此时capitalGain", capitalGain);
      console.log("此时amountToWithdraw", amountToWithdraw);
      investment.incr_value(-amountToWithdraw);
      console.log("此时investment的value", investment.get_value());
      state.incr_capital_gains_income(capitalGain);
      
    } else if (accountType === TaxStatus.PRE_TAX) {
      console.log("此时accountType是pre-tax", accountType);
      investment.incr_value(-amountToWithdraw);
      state.incr_ordinary_income(amountToWithdraw);
      console.log("此时investment的value", investment.get_value());
    }

    // Check for early withdrawal penalties (before age 59.5)
    if (
      (accountType === TaxStatus.PRE_TAX ||
        accountType === TaxStatus.AFTER_TAX) &&
      state.user.get_age() < 60
    ) {
      console.log("此时用户年龄是", state.user.get_age());
      // Track early withdrawals
      state.incr_early_withdrawal_penalty(amountToWithdraw * 0.1);
      investment.incr_value(-amountToWithdraw);
      console.log("此时early withdrawal penalty", amountToWithdraw * 0.1);
      console.log("此时investment的value", investment.get_value());
      console.log(
        "此时state的early withdrawal penalty",
        state.get_early_withdrawal_penalty()
      );
    }
  }

  // Return information about the withdrawal
  // ?你有没有可能支付多余你需要的？
  return {
    unfunded: remainingAmount > 0 ? remainingAmount : 0,
  };
}
