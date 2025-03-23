// src/core/simulation/PayMandatoryExpense.ts
/**
 * This module handles mandatory expenses and tax payments in the financial simulation.
 * It processes non-discretionary expenses and the previous year's taxes,
 * withdrawing from investments as needed according to the user's strategy.
 */

import { SimulationState } from "./SimulationState";
import { Event } from "../domain/event/Event";
import { ChangeType, TaxStatus, IncomeType } from "../Enums";
import { Investment } from "../domain/investment/Investment";

// Track state across simulation years
interface TaxTrackingState {
  prev_year_ordinary_income: number;
  prev_year_social_security_income: number;
  prev_year_capital_gains_income: number;
  prev_year_early_withdrawals: number;
  tax_payments: Map<string, number>;
  start_year: number;
}

// Create the tax tracking state when needed
let taxTrackingState: TaxTrackingState = {
  prev_year_ordinary_income: 0,
  prev_year_social_security_income: 0,
  prev_year_capital_gains_income: 0,
  prev_year_early_withdrawals: 0,
  tax_payments: new Map<string, number>(),
  start_year: new Date().getFullYear(),
};

/**
 * Process mandatory expense events and previous year's taxes for the current year
 * @param state The current simulation state
 * @returns void
 */
export function pay_mandatory_expenses(state: SimulationState): void {
  // SEQUENTIAL THINKING STEP 1: Identify mandatory expenses for the current year
  const currentYear = state.get_current_year();

  // Create an array of mandatory expense events (non-discretionary)
  const mandatoryExpenses: Event[] = [];
  for (const [_, event] of state.events_by_type.expense) {
    if (!(event as any).discretionary && is_event_active(event, currentYear)) {
      mandatoryExpenses.push(event);
    }
  }

  // SEQUENTIAL THINKING STEP 2: Calculate total mandatory expenses amount for this year only
  let totalMandatoryExpenseAmount = 0;
  for (const expense of mandatoryExpenses) {
    // Calculate the amount for this specific year only
    const expenseAmount = get_expense_amount_for_current_year(
      expense,
      currentYear,
      state.inflation_factor
    );

    totalMandatoryExpenseAmount += expenseAmount;
    // Track paid amount for reporting
    (expense as any).paid_amount = expenseAmount;
  }

  // SEQUENTIAL THINKING STEP 3: Process previous year's taxes if not in first simulation year
  let totalTaxAmount = 0;
  let earlyWithdrawalTax = 0;

  // Update the start year if needed
  if (currentYear < taxTrackingState.start_year) {
    taxTrackingState.start_year = currentYear;
  }

  if (currentYear > taxTrackingState.start_year) {
    // Create a temporary simulation state to process the previous year's taxes
    // We do this because process_tax works with the state's current income values
    const originalOrdinaryIncome = state.get_ordinary_income();
    const originalSocialSecurityIncome = state.get_social_security_income();
    const originalCapitalGainsIncome = state.get_capital_gains_income();

    // Set state to previous year's values to calculate taxes
    // @ts-ignore - Direct access to income tracking variables
    state.incr_ordinary_income(
      taxTrackingState.prev_year_ordinary_income - originalOrdinaryIncome
    );
    // @ts-ignore - Direct access to income tracking variables
    state.incr_social_security_income(
      taxTrackingState.prev_year_social_security_income -
        originalSocialSecurityIncome
    );
    // @ts-ignore - Direct access to income tracking variables
    state.incr_capital_gains_income(
      taxTrackingState.prev_year_capital_gains_income -
        originalCapitalGainsIncome
    );

    // Save original cash value
    const originalCashValue = state.cash.get_value();

    // Process taxes using the simulation state's built-in method
    state.process_tax();

    // Calculate the tax amount (the difference in cash value)
    totalTaxAmount = state.cash.get_value() - originalCashValue;

    // Restore the original cash value and income values
    // @ts-ignore - Direct access to cash value
    state.cash.incr_value(originalCashValue - state.cash.get_value());
    // @ts-ignore - Direct access to income tracking variables
    state.incr_ordinary_income(
      originalOrdinaryIncome - state.get_ordinary_income()
    );
    // @ts-ignore - Direct access to income tracking variables
    state.incr_social_security_income(
      originalSocialSecurityIncome - state.get_social_security_income()
    );
    // @ts-ignore - Direct access to income tracking variables
    state.incr_capital_gains_income(
      originalCapitalGainsIncome - state.get_capital_gains_income()
    );

    // Calculate early withdrawal tax if applicable
    const prevYearEarlyWithdrawals =
      taxTrackingState.prev_year_early_withdrawals;
    earlyWithdrawalTax = calculate_early_withdrawal_tax(
      prevYearEarlyWithdrawals
    );

    // Add early withdrawal tax to total tax amount
    totalTaxAmount += earlyWithdrawalTax;
  }

  // SEQUENTIAL THINKING STEP 4: Calculate total payment amount
  const totalPaymentAmount = totalMandatoryExpenseAmount + totalTaxAmount;

  // SEQUENTIAL THINKING STEP 5: Check if additional withdrawals are needed
  const cashValue = state.cash.get_value();
  const totalWithdrawalAmount = Math.max(0, totalPaymentAmount - cashValue);

  // SEQUENTIAL THINKING STEP 6: Withdraw funds if needed based on withdrawal strategy
  if (totalWithdrawalAmount > 0) {
    withdraw_from_investments(state, totalWithdrawalAmount);
  }

  // SEQUENTIAL THINKING STEP 7: Pay expenses and taxes by deducting from cash
  // @ts-ignore - Direct access to cash value
  state.cash.incr_value(-totalPaymentAmount);

  // SEQUENTIAL THINKING STEP 8: Store tax payments for reporting
  taxTrackingState.tax_payments.set(
    "income_tax",
    totalTaxAmount - earlyWithdrawalTax
  );
  taxTrackingState.tax_payments.set("early_withdrawal_tax", earlyWithdrawalTax);

  // SEQUENTIAL THINKING STEP 9: Update tracking state for next year's tax calculations
  taxTrackingState.prev_year_ordinary_income = state.get_ordinary_income();
  taxTrackingState.prev_year_social_security_income =
    state.get_social_security_income();
  taxTrackingState.prev_year_capital_gains_income =
    state.get_capital_gains_income();
  // Early withdrawals will be tracked in the withdraw_from_investments function
  taxTrackingState.prev_year_early_withdrawals = 0;
}

/**
 * Calculate the early withdrawal tax penalty (typically 10% for retirement accounts)
 * @param earlyWithdrawalAmount The amount withdrawn early from retirement accounts
 * @returns The early withdrawal tax penalty
 */
function calculate_early_withdrawal_tax(earlyWithdrawalAmount: number): number {
  // Early withdrawal penalty is typically 10%
  const EARLY_WITHDRAWAL_PENALTY_RATE = 0.1;
  return earlyWithdrawalAmount * EARLY_WITHDRAWAL_PENALTY_RATE;
}

/**
 * Withdraw funds from investments according to the expense withdrawal strategy
 * This function also tracks capital gains and updates relevant income counters
 * @param state The simulation state
 * @param amountNeeded The amount that needs to be withdrawn
 */
function withdraw_from_investments(
  state: SimulationState,
  amountNeeded: number
): void {
  let remainingAmount = amountNeeded;

  // Go through the withdrawal strategy in order
  for (const investmentId of state.expense_withrawal_strategy || []) {
    if (remainingAmount <= 0) break;

    // Look for the investment in all account types
    let investment: Investment | undefined;
    let accountType: TaxStatus | undefined;

    // Use the TaxStatus enum instead of string literals
    for (const type of [
      TaxStatus.NON_RETIREMENT,
      TaxStatus.PRE_TAX,
      TaxStatus.AFTER_TAX,
    ] as const) {
      // Need to get the account map that corresponds to the enum value
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

    if (!investment || investment === state.cash || !accountType) continue;

    // Get the current value and purchase price of the investment
    const currentValue = investment.get_value();
    const purchasePrice = (investment as any).get_cost_basis?.() || 0;

    // Calculate how much to withdraw from this investment
    const amountToWithdraw = Math.min(currentValue, remainingAmount);
    if (amountToWithdraw <= 0) continue;

    // Calculate the fraction of the investment being sold
    const fraction = amountToWithdraw / currentValue;

    // Withdraw the funds
    investment.incr_value(-amountToWithdraw);
    state.cash.incr_value(amountToWithdraw);
    remainingAmount -= amountToWithdraw;

    // Handle tax implications based on the account type
    if (accountType === TaxStatus.NON_RETIREMENT) {
      // For non-retirement accounts, calculate capital gains
      const capitalGain = amountToWithdraw - fraction * purchasePrice;
      state.incr_capital_gains_income(capitalGain);

      // Update the purchase price after partial sale
      (investment as any).incr_cost_basis?.(-fraction * purchasePrice);
    } else if (accountType === TaxStatus.PRE_TAX) {
      // For pre-tax accounts, the entire withdrawal counts as ordinary income
      state.incr_ordinary_income(amountToWithdraw);
    }

    // Check for early withdrawal penalties (before age 59.5)
    if (
      (accountType === TaxStatus.PRE_TAX ||
        accountType === TaxStatus.AFTER_TAX) &&
      state.user.get_age() < 59
    ) {
      // Track early withdrawals for tax calculation in next year
      taxTrackingState.prev_year_early_withdrawals += amountToWithdraw;
    }
  }

  // If we still have remaining amount to withdraw and no more investments
  // This is an emergency situation where we can't cover expenses
  if (remainingAmount > 0) {
    console.warn(
      `Insufficient funds to cover mandatory expenses: $${remainingAmount} short`
    );
    // In a real application, this might trigger special handling or alerts
  }
}


/**
 * Helper function to check if an event is active in the current year
 * @param event The event to check
 * @param current_year The current simulation year
 * @returns True if the event is active, false otherwise
 */
function is_event_active(event: Event, current_year: number): boolean {
  return (
    current_year >= event.start && current_year < event.start + event.duration
  );
}

/**
 * Get the expense amount for the current year, taking into account the event's history
 * and the correct amount for this specific year
 *
 * @param event The expense event
 * @param currentYear The current simulation year
 * @param inflationFactor The cumulative inflation factor
 * @returns The expense amount for the current year only
 */
function get_expense_amount_for_current_year(
  event: any,
  currentYear: number,
  inflationFactor: number
): number {
  // Keep track of the event's current amount across simulation years
  if (!(event as any).current_amount) {
    // First time calculating this event, start with initial amount
    (event as any).current_amount = (event as any).initial_amount;
    (event as any).last_processed_year = event.start;
  }

  // If there's a gap in years (simulation jumped ahead), catch up the amount
  if ((event as any).last_processed_year < currentYear - 1) {
    // Catch up calculations for missed years
    for (let y = (event as any).last_processed_year + 1; y < currentYear; y++) {
      update_event_amount_for_year(event, y, inflationFactor);
    }
  }

  // Update the amount for the current year
  update_event_amount_for_year(event, currentYear, inflationFactor);

  // Return the current year's amount
  return (event as any).current_amount;
}

/**
 * Updates an event's amount for a specific year
 *
 * @param event The event to update
 * @param year The year to calculate for
 * @param inflationFactor The cumulative inflation factor
 */
function update_event_amount_for_year(
  event: any,
  year: number,
  inflationFactor: number
): void {
  let amount = (event as any).current_amount;

  // Apply the annual change for this specific year
  if (event.change_type === ChangeType.FIXED) {
    amount += event.expected_annual_change;
  } else if (event.change_type === ChangeType.PERCENTAGE) {
    amount *= 1 + event.expected_annual_change;
  }

  // Apply inflation adjustment if needed
  if (event.inflation_adjusted && year > (event as any).last_processed_year) {
    // Only apply inflation for the years that haven't been processed
    // The exact inflation calculation would depend on your model
    // Here we're making a simplification
    amount *= inflationFactor / (event as any).last_inflation_factor || 1;
  }

  // Update the event's stored values
  (event as any).current_amount = amount;
  (event as any).last_processed_year = year;
  (event as any).last_inflation_factor = inflationFactor;
}
