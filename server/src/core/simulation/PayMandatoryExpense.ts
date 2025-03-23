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
import { Scenario } from "../domain/scenario/Scenario";

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
export function pay_mandatory_expenses(
  state: SimulationState & Partial<Scenario>
): void {
  // SEQUENTIAL THINKING STEP 1: Identify mandatory expenses for the current year
  const currentYear = state.get_current_year();

  // Create an array of mandatory expense events (non-discretionary)
  const mandatoryExpenses: Event[] = [];
  for (const [_, event] of state.events_by_type.expense) {
    if (!(event as any).discretionary && is_event_active(event, currentYear)) {
      mandatoryExpenses.push(event);
    }
  }

  // SEQUENTIAL THINKING STEP 2: Calculate previous year's taxes
  // Only calculate taxes if we're past the first year of simulation
  let federalIncomeTax = 0;
  let stateIncomeTax = 0;
  let capitalGainsTax = 0;
  let earlyWithdrawalTax = 0;

  // Update the start year if not set
  if (currentYear < taxTrackingState.start_year) {
    taxTrackingState.start_year = currentYear;
  }

  if (currentYear > taxTrackingState.start_year) {
    // Calculate federal income tax
    federalIncomeTax = calculate_federal_income_tax(
      state,
      taxTrackingState.prev_year_ordinary_income,
      taxTrackingState.prev_year_social_security_income
    );

    // Calculate state income tax
    stateIncomeTax = calculate_state_income_tax(
      state,
      taxTrackingState.prev_year_ordinary_income,
      taxTrackingState.prev_year_social_security_income
    );

    // Calculate capital gains tax (ensure it's not negative)
    const prevYearCapitalGains =
      taxTrackingState.prev_year_capital_gains_income;
    capitalGainsTax = Math.max(
      0,
      calculate_capital_gains_tax(
        state,
        prevYearCapitalGains,
        taxTrackingState.prev_year_ordinary_income
      )
    );

    // Calculate early withdrawal tax if applicable
    const prevYearEarlyWithdrawals =
      taxTrackingState.prev_year_early_withdrawals;
    earlyWithdrawalTax = calculate_early_withdrawal_tax(
      prevYearEarlyWithdrawals
    );
  }

  // SEQUENTIAL THINKING STEP 3: Find the cash account for payments
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

  // SEQUENTIAL THINKING STEP 4: Calculate total payment amount (P)
  // Sum of non-discretionary expenses and previous year's taxes
  let totalPaymentAmount = 0;

  // Add up all mandatory expenses for the current year
  for (const expense of mandatoryExpenses) {
    const yearsActive = currentYear - expense.start;
    const expenseAmount = calculate_event_amount(
      expense,
      (expense as any).initial_amount,
      yearsActive,
      state.inflation_factor
    );
    totalPaymentAmount += expenseAmount;
  }

  // Add all taxes
  const totalTaxes =
    federalIncomeTax + stateIncomeTax + capitalGainsTax + earlyWithdrawalTax;
  totalPaymentAmount += totalTaxes;

  // SEQUENTIAL THINKING STEP 5: Calculate total withdrawal amount (W)
  const cashValue = (cashAccount as any).value;
  const totalWithdrawalAmount = Math.max(0, totalPaymentAmount - cashValue);

  // SEQUENTIAL THINKING STEP 6: Withdraw funds if needed
  if (totalWithdrawalAmount > 0) {
    withdraw_from_investments(state, totalWithdrawalAmount);
  }

  // SEQUENTIAL THINKING STEP 7: Pay expenses and taxes
  (cashAccount as any).value -= totalPaymentAmount;

  // SEQUENTIAL THINKING STEP 8: Record payments for reporting
  for (const expense of mandatoryExpenses) {
    const yearsActive = currentYear - expense.start;
    const expenseAmount = calculate_event_amount(
      expense,
      (expense as any).initial_amount,
      yearsActive,
      state.inflation_factor
    );
    (expense as any).paid_amount = expenseAmount;
  }

  // Store tax payments in our tracking state
  taxTrackingState.tax_payments.set("federal_income_tax", federalIncomeTax);
  taxTrackingState.tax_payments.set("state_income_tax", stateIncomeTax);
  taxTrackingState.tax_payments.set("capital_gains_tax", capitalGainsTax);
  taxTrackingState.tax_payments.set("early_withdrawal_tax", earlyWithdrawalTax);

  // Update tracking state for next year's tax calculations
  // Save current year values for next year's tax calculations
  taxTrackingState.prev_year_ordinary_income = state.get_ordinary_income();
  taxTrackingState.prev_year_social_security_income =
    state.get_social_security_income();
  taxTrackingState.prev_year_capital_gains_income =
    state.get_capital_gains_income();
  // Early withdrawals will be tracked in the withdraw_from_investments function
  taxTrackingState.prev_year_early_withdrawals = 0;
}

/**
 * Calculate the federal income tax
 */
function calculate_federal_income_tax(
  state: SimulationState & Partial<Scenario>,
  ordinaryIncome: number,
  socialSecurityIncome: number
): number {
  // Use federal tax service to calculate income tax based on filing status
  // Find the tax rate for the income and apply it
  const taxableIncome = ordinaryIncome + socialSecurityIncome;
  const taxRate = state.federal_tax_service.find_rate(
    taxableIncome,
    IncomeType.TAXABLE_INCOME,
    state.get_tax_filing_status()
  );

  return taxableIncome * taxRate;
}

/**
 * Calculate the state income tax
 */
function calculate_state_income_tax(
  state: SimulationState & Partial<Scenario>,
  ordinaryIncome: number,
  socialSecurityIncome: number
): number {
  // For simplicity, using a static state tax rate
  // In a real implementation, this would use the state tax service
  const STATE_TAX_RATE = 0.05; // Example state tax rate of 5%
  return (ordinaryIncome + socialSecurityIncome) * STATE_TAX_RATE;
}

/**
 * Calculate the capital gains tax
 */
function calculate_capital_gains_tax(
  state: SimulationState & Partial<Scenario>,
  capitalGains: number,
  ordinaryIncome: number
): number {
  // If there are no capital gains or there's a loss, no tax is due
  if (capitalGains <= 0) {
    return 0;
  }

  // Use federal tax service to find the capital gains tax rate
  const taxRate = state.federal_tax_service.find_rate(
    ordinaryIncome,
    IncomeType.CAPITAL_GAINS,
    state.get_tax_filing_status()
  );

  return capitalGains * taxRate;
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
    const amountToWithdraw = Math.min(currentValue, remainingAmount);
    if (amountToWithdraw <= 0) continue;

    // Calculate the fraction of the investment being sold
    const fraction = amountToWithdraw / currentValue;

    // Withdraw the funds
    (investment as any).value -= amountToWithdraw;
    (cashAccount as any).value += amountToWithdraw;
    remainingAmount -= amountToWithdraw;

    // Handle tax implications based on the account type
    if (accountType === "non_retirement") {
      // For non-retirement accounts, calculate capital gains
      const capitalGain = amountToWithdraw - fraction * purchasePrice;
      state.incr_capital_gains_income(capitalGain);

      // Update the purchase price after partial sale
      (investment as any).purchase_price = purchasePrice * (1 - fraction);
    } else if (accountType === "pre_tax") {
      // For pre-tax accounts, the entire withdrawal counts as ordinary income
      state.incr_ordinary_income(amountToWithdraw);
    }

    // Check for early withdrawal penalties (before age 59.5)
    if (
      (accountType === "pre_tax" || accountType === "after_tax") &&
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
 * Helper function to calculate the current amount for an event based on
 * its initial amount, changes over time, and inflation
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
 * @param event The event to check
 * @param current_year The current simulation year
 * @returns True if the event is active, false otherwise
 */
function is_event_active(event: Event, current_year: number): boolean {
  return (
    current_year >= event.start && current_year < event.start + event.duration
  );
}
