// src/core/simulation/PayMandatoryExpense.ts

import { SimulationState } from "./SimulationState";
import { Event } from "../domain/event/Event";
import { ChangeType } from "../Enums";
import { Investment } from "../domain/investment/Investment";
import { Scenario } from "../domain/scenario/Scenario";

/**
 * Process mandatory expense events for the current year
 * @param state The current simulation state
 * @returns void
 */
export function pay_mandatory_expenses(
  state: SimulationState & Partial<Scenario>
): void {
  const currentYear = state.get_current_year();

  // 1. Identify mandatory expense events that are active in the current year
  const mandatoryExpenses: Event[] = [];
  for (const [_, event] of state.events_by_type.expense) {
    if (!(event as any).discretionary && is_event_active(event, currentYear)) {
      mandatoryExpenses.push(event);
    }
  }

  // If no mandatory expenses are active, return early
  if (mandatoryExpenses.length === 0) {
    return;
  }

  // Get cash investment (assuming it has an ID of "cash")
  let cashAccount: Investment | undefined;
  for (const [id, investment] of state.accounts.non_retirement) {
    if (id.toLowerCase() === "cash") {
      cashAccount = investment;
      break;
    }
  }

  if (!cashAccount) {
    console.warn("No cash account found for mandatory expenses");
    return;
  }

  // Process each mandatory expense
  for (const expense of mandatoryExpenses) {
    // Calculate the expense amount for the current year
    const yearsActive = currentYear - expense.start;
    const expenseAmount = calculate_event_amount(
      expense,
      (expense as any).initial_amount,
      yearsActive,
      state.inflation_factor
    );

    // For mandatory expenses, we must pay the full amount regardless of financial goal
    const amountToSpend = expenseAmount;

    // Check if there's enough cash
    if ((cashAccount as any).value < amountToSpend) {
      // Need to withdraw from investments
      const amountToWithdraw = amountToSpend - (cashAccount as any).value;
      withdraw_from_investments(state, amountToWithdraw);
    }

    // Pay the expense
    (cashAccount as any).value -= amountToSpend;

    // For tracking/reporting purposes
    (expense as any).paid_amount = amountToSpend;
  }
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
