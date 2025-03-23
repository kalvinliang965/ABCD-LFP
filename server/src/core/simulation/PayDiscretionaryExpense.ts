// src/core/simulation/PayDiscretionaryExpense.ts
/**
 * This module handles discretionary expenses in the financial simulation.
 * It processes discretionary expenses according to the spending strategy,
 * ensuring that total assets never fall below the financial goal.
 * Unlike mandatory expenses, discretionary expenses can be partially paid
 * or skipped entirely to maintain the financial goal.
 */

import { SimulationState } from "./SimulationState";
import { Event } from "../domain/event/Event";
import { ChangeType } from "../Enums";
import { Investment } from "../domain/investment/Investment";
import { Scenario } from "../domain/scenario/Scenario";

/**
 * Process discretionary expense events for the current year
 * @param state The current simulation state
 * @returns void
 */
export function pay_discretionary_expenses(state: SimulationState): void {
  // SEQUENTIAL THINKING STEP 1: Identify discretionary expense events for the current year
  const currentYear = state.get_current_year();

  // Create an array of discretionary expense events by filtering the expense events
  const discretionaryExpenses: Event[] = [];
  for (const [_, event] of state.events_by_type.expense) {
    if ((event as any).discretionary && is_event_active(event, currentYear)) {
      discretionaryExpenses.push(event);
    }
  }

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
  let cashAccount: Investment | undefined;
  for (const [id, investment] of state.accounts.non_retirement) {
    if (id.toLowerCase() === "cash") {
      cashAccount = investment;
      break;
    }
  }

  if (!cashAccount) {
    console.warn("No cash account found for discretionary expenses");
    return;
  }

  // SEQUENTIAL THINKING STEP 5: Process each discretionary expense in order of priority
  // Stop processing if available funds are depleted
  for (const expense of orderedExpenses) {
    // If we've used all available funds, stop paying discretionary expenses
    if (availableFunds <= 0) {
      // For reporting purposes, mark remaining expenses as not paid
      (expense as any).paid_amount = 0;
      continue;
    }

    // SEQUENTIAL THINKING STEP 5.1: Calculate the expense amount for the current year
    const yearsActive = currentYear - expense.start;
    const expenseAmount = calculate_event_amount(
      expense,
      (expense as any).initial_amount,
      yearsActive,
      state.inflation_factor
    );

    // SEQUENTIAL THINKING STEP 5.2: Determine how much can be spent on this expense
    // Key difference from mandatory expenses: discretionary expenses can be partially paid
    // to avoid going below the financial goal
    const amountToSpend = Math.min(expenseAmount, availableFunds);

    // SEQUENTIAL THINKING STEP 5.3: Check if there's enough cash for the expense
    if ((cashAccount as any).value < amountToSpend) {
      // Need to withdraw from investments to cover the shortfall
      const amountToWithdraw = amountToSpend - (cashAccount as any).value;

      // SEQUENTIAL THINKING STEP 5.4: Withdraw funds from investments following the strategy
      withdraw_from_investments(state, amountToWithdraw);
    }

    // SEQUENTIAL THINKING STEP 5.5: Pay the expense (full or partial)
    (cashAccount as any).value -= amountToSpend;

    // Reduce available funds for subsequent discretionary expenses
    availableFunds -= amountToSpend;

    // For tracking/reporting purposes, record how much was paid for this expense
    (expense as any).paid_amount = amountToSpend;

    // SEQUENTIAL THINKING STEP 5.6: Log partial payments for user awareness
    if (amountToSpend < expenseAmount) {
      console.info(
        `Discretionary expense "${expense.name}" partially paid: $${amountToSpend} of $${expenseAmount} to maintain financial goal`
      );
    }
  }
}

/**
 * Order expenses according to the spending strategy
 * This function arranges discretionary expenses in the priority order specified by the user.
 * Expenses not explicitly mentioned in the strategy are added at the end.
 *
 * @param expenses Array of discretionary expense events
 * @param strategy User-defined spending strategy (ordered list of expense names)
 * @returns Ordered array of expense events
 */
function order_expenses_by_strategy(
  expenses: Event[],
  strategy: string[]
): Event[] {
  // Create a map for quick lookup of expenses by name
  const expenseMap = new Map<string, Event>();
  expenses.forEach((expense) => expenseMap.set(expense.name, expense));

  const orderedExpenses: Event[] = [];

  // First add expenses in the order specified by the strategy
  // This represents the user's priority order for discretionary spending
  for (const expenseName of strategy) {
    const expense = expenseMap.get(expenseName);
    if (expense) {
      orderedExpenses.push(expense);
      expenseMap.delete(expenseName);
    }
  }

  // Then add any remaining expenses not specified in the strategy
  // These will be processed after the explicitly prioritized expenses
  expenseMap.forEach((expense) => orderedExpenses.push(expense));

  return orderedExpenses;
}

/**
 * Calculate the total assets across all accounts
 * This function sums up the values of all investments across all account types
 * to determine the user's total net worth.
 *
 * @param state The current simulation state
 * @returns Total value of all assets
 */
function calculate_total_assets(state: SimulationState): number {
  let total = 0;

  // Add up all non-retirement accounts
  state.accounts.non_retirement.forEach((account) => {
    total += (account as any).value;
  });

  // Add up all pre-tax accounts
  state.accounts.pre_tax.forEach((account) => {
    total += (account as any).value;
  });

  // Add up all after-tax accounts
  state.accounts.after_tax.forEach((account) => {
    total += (account as any).value;
  });

  return total;
}

/**
 * Withdraw funds from investments according to the expense withdrawal strategy
 * This function liquidates investments in the order specified by the withdrawal strategy
 * until the required amount is obtained. It also handles tax implications of withdrawals.
 *
 * @param state The simulation state
 * @param amountNeeded The amount that needs to be withdrawn
 */
function withdraw_from_investments(
  state: SimulationState & Partial<Scenario>,
  amountNeeded: number
): void {
  let remainingAmount = amountNeeded;
  let cashAccount: Investment | undefined;

  // Find the cash account for depositing the withdrawn funds
  for (const [id, investment] of state.accounts.non_retirement) {
    if (id.toLowerCase() === "cash") {
      cashAccount = investment;
      break;
    }
  }

  if (!cashAccount) {
    console.warn("No cash account found for withdrawals");
    return;
  }

  // Go through the withdrawal strategy in order - this is the priority order
  // for liquidating investments to pay expenses
  for (const investmentId of state.expense_withrawal_strategy || []) {
    if (remainingAmount <= 0) break;

    // Look for the investment in all account types
    let investment: Investment | undefined;
    let accountType: "non_retirement" | "pre_tax" | "after_tax" | undefined;

    for (const type of ["non_retirement", "pre_tax", "after_tax"] as const) {
      const account = state.accounts[type].get(investmentId);
      if (account) {
        investment = account;
        accountType = type;
        break;
      }
    }

    if (!investment || investment === cashAccount || !accountType) continue;

    // Get the current value and purchase price of the investment
    const currentValue = (investment as any).value;
    const purchasePrice = (investment as any).purchase_price || 0;

    // Calculate how much to withdraw from this investment
    // This can be the full amount needed or a partial amount if the investment
    // doesn't have enough value
    const amountToWithdraw = Math.min(currentValue, remainingAmount);
    if (amountToWithdraw <= 0) continue;

    // Calculate the fraction of the investment being sold for capital gains purposes
    const fraction = amountToWithdraw / currentValue;

    // Withdraw the funds - update both the source investment and cash account
    (investment as any).value -= amountToWithdraw;
    (cashAccount as any).value += amountToWithdraw;
    remainingAmount -= amountToWithdraw;

    // Handle tax implications based on the account type
    if (accountType === "non_retirement") {
      // For non-retirement accounts, calculate capital gains (or losses)
      const capitalGain = amountToWithdraw - fraction * purchasePrice;
      state.incr_capital_gains_income(capitalGain);

      // Update the purchase price after partial sale
      (investment as any).purchase_price = purchasePrice * (1 - fraction);
    } else if (accountType === "pre_tax") {
      // For pre-tax accounts, the entire withdrawal counts as ordinary income
      state.incr_ordinary_income(amountToWithdraw);
    }

    // Note: No tax implications for after-tax accounts during withdrawal
    // (taxes were already paid when contributions were made)

    // Early withdrawals from retirement accounts would incur penalties
    // For demonstration purposes, we just log this since the state doesn't have
    // a direct method to track early withdrawals in this implementation
    if (
      (accountType === "pre_tax" || accountType === "after_tax") &&
      state.user.get_age() < 59
    ) {
      console.info(
        `Early withdrawal penalty would apply: $${amountToWithdraw} from ${accountType} account`
      );
    }
  }

  // If we still have remaining amount to withdraw and no more investments,
  // this indicates we couldn't fully fund the withdrawal request
  if (remainingAmount > 0) {
    console.warn(
      `Insufficient funds to fully withdraw: $${remainingAmount} short`
    );
  }
}

/**
 * Helper function to calculate the current amount for an event based on
 * its initial amount, changes over time, and inflation
 *
 * @param event The event object
 * @param initial_amount The initial amount of the event
 * @param years_active How many years the event has been active
 * @param inflation_factor The cumulative inflation factor
 * @returns The calculated amount for the current year
 */
function calculate_event_amount(
  event: any,
  initial_amount: number,
  years_active: number,
  inflation_factor: number
): number {
  let amount = initial_amount;

  // Apply annual changes for each year the event has been active
  for (let i = 0; i < years_active; i++) {
    if (event.change_type === ChangeType.FIXED) {
      // Fixed amount change: add the same amount each year
      amount += event.expected_annual_change;
    } else if (event.change_type === ChangeType.PERCENTAGE) {
      // Percentage change: compound growth or reduction
      amount *= 1 + event.expected_annual_change;
    }
  }

  // Apply inflation adjustment if the event is inflation-adjusted
  if (event.inflation_adjusted) {
    amount *= inflation_factor;
  }

  return amount;
}

/**
 * Helper function to check if an event is active in the current year
 * An event is active if the current year is within the event's duration.
 *
 * @param event The event to check
 * @param current_year The current simulation year
 * @returns True if the event is active, false otherwise
 */
function is_event_active(event: Event, current_year: number): boolean {
  return (
    current_year >= event.start && current_year < event.start + event.duration
  );
}
