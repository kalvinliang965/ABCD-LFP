// src/core/simulation/PayDiscretionaryExpense.ts
/**
 * 1. 总体来讲，我需要筛选出来哪个event是discretionary expense
 * 2. 对于筛选出来的event，我还需要关注这个event是不是还active？ 也就是是不是during这个year？或者还没有开始？
 *  2.1 那么最好要有一个常量来存储哪个event是discretionary expense，这样避免反复读取
 *
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
export function pay_discretionary_expenses(
  state: SimulationState & Partial<Scenario>
): void {
  const currentYear = state.get_current_year();

  // 1. Identify discretionary expense events that are active in the current year
  // todo: we could just check if the event == expense, and then check if it's discretionary
  // todo: event as any is not a good practice
  const discretionaryExpenses: Event[] = [];
  for (const [_, event] of state.events_by_type.expense) {
    if ((event as any).discretionary && is_event_active(event, currentYear)) {
      discretionaryExpenses.push(event);
    }
  }

  // If no discretionary expenses are active, return early (fr)
  if (discretionaryExpenses.length === 0) {
    return;
  }

  // 2. Order discretionary expenses according to the spending strategy
  const orderedExpenses = order_expenses_by_strategy(
    discretionaryExpenses,
    state.spending_strategy || []
  );

  // 3. Calculate total assets and available funds
  const totalAssets = calculate_total_assets(state);
  const financialGoal = state.financialGoal || 0;
  let availableFunds = Math.max(0, totalAssets - financialGoal);

  // Get cash investment (assuming it has an ID of "cash")
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

  // 4. Process each discretionary expense in order
  for (const expense of orderedExpenses) {
    if (availableFunds <= 0) {
      break; // Stop if no more funds are available
    }

    // Calculate the expense amount for the current year
    const yearsActive = currentYear - expense.start;
    const expenseAmount = calculate_event_amount(
      expense,
      (expense as any).initial_amount,
      yearsActive,
      state.inflation_factor
    );

    // Determine how much can be spent
    const amountToSpend = Math.min(expenseAmount, availableFunds);

    // Check if there's enough cash
    if ((cashAccount as any).value < amountToSpend) {
      // Need to withdraw from investments
      const amountToWithdraw = amountToSpend - (cashAccount as any).value;
      withdraw_from_investments(state, amountToWithdraw);
    }

    // Pay the expense
    (cashAccount as any).value -= amountToSpend;
    availableFunds -= amountToSpend;

    // For tracking/reporting purposes
    (expense as any).paid_amount = amountToSpend;
  }
}

/**
 * Order expenses according to the spending strategy
 */
function order_expenses_by_strategy(
  expenses: Event[],
  strategy: string[]
): Event[] {
  const expenseMap = new Map<string, Event>();
  expenses.forEach((expense) => expenseMap.set(expense.name, expense));

  const orderedExpenses: Event[] = [];

  // First add expenses in the order specified by the strategy
  for (const expenseName of strategy) {
    const expense = expenseMap.get(expenseName);
    if (expense) {
      orderedExpenses.push(expense);
      expenseMap.delete(expenseName);
    }
  }

  // Then add any remaining expenses not specified in the strategy
  expenseMap.forEach((expense) => orderedExpenses.push(expense));

  return orderedExpenses;
}

/**
 * todo: this could be done by others
 * Calculate the total assets across all accounts
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
 */
function withdraw_from_investments(
  state: SimulationState & Partial<Scenario>,
  amountNeeded: number
): void {
  let remainingAmount = amountNeeded;
  let cashAccount: Investment | undefined;

  // Find the cash account
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

  // Go through the withdrawal strategy in order
  for (const investmentId of state.expense_withrawal_strategy || []) {
    if (remainingAmount <= 0) break;

    // Look for the investment in all account types
    let investment: Investment | undefined;
    for (const accountType of [
      "non_retirement",
      "pre_tax",
      "after_tax",
    ] as const) {
      const account = state.accounts[accountType].get(investmentId);
      if (account) {
        investment = account;
        break;
      }
    }

    if (!investment || investment === cashAccount) continue;

    // Calculate how much to withdraw from this investment
    const amountToWithdraw = Math.min(
      (investment as any).value,
      remainingAmount
    );
    if (amountToWithdraw <= 0) continue;

    // Withdraw the funds
    (investment as any).value -= amountToWithdraw;
    (cashAccount as any).value += amountToWithdraw;
    remainingAmount -= amountToWithdraw;

    // If the investment is taxable, handle tax implications
    if (investment.taxStatus === "NON_RETIREMENT") {
      // For simplicity, assuming any withdrawal from non-retirement accounts
      // generates capital gains income
      state.incr_capital_gains_income(amountToWithdraw);
    } else if (investment.taxStatus === "PRE_TAX") {
      // Withdrawals from pre-tax accounts generate ordinary income
      state.incr_ordinary_income(amountToWithdraw);
    }
    // No tax implications for after-tax accounts
  }
}

/**
 * Helper function to calculate the current amount for an event
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
      amount += event.expected_annual_change;
    } else if (event.change_type === ChangeType.PERCENTAGE) {
      amount *= 1 + event.expected_annual_change;
    }
  }

  // Apply inflation adjustment if needed
  if (event.inflation_adjusted) {
    amount *= inflation_factor;
  }

  return amount;
}

/**
 * Helper function to check if an event is active in the current year
 */
function is_event_active(event: Event, current_year: number): boolean {
  return (
    current_year >= event.start && current_year < event.start + event.duration
  );
}
