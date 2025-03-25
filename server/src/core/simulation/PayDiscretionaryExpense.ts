// src/core/simulation/PayDiscretionaryExpense.ts
/**
 * This module handles discretionary expenses in the financial simulation.
 * It processes discretionary expenses according to the spending strategy,
 * while ensuring the user's total assets don't fall below the financial goal.
 * 请你仔细研究PayMandatoryExpense，我们现在有一个类似的文件叫做PayDiscretionaryExpense。这个文件的大体需求与PayMandatory一致。你可以通过类似于PayMandatory的方法来获取所必须的参数等。

现在请你更新并实现PayDiscretionaryExpenses。使用sequencial thinking

Pay non-discretionary expenses and the previous year's taxes, i.e., subtract them from the cash investment.  Perform additional withdrawals if needed to pay them.
Calculate the previous year's federal and state income tax using the value of curYearIncome and curYearSS from the previous year, and inflation-adjusted federal and state income tax data (rates, brackets, and standard deduction) for the previous year.
Calculate the previous year's capital gains tax using the value of curYearGains from the previous year, and inflation-adjusted federal capital gains tax data for the previous year. I recommend SmartAsset's article on capital gains tax  Note that capital gains tax cannot be negative, even if the user has a net loss.  The IRS allows carrying capital losses forward to future years; we ignore this.
Calculate the previous year's early withdrawal tax, using the value of curYearEarlyWithdrawals from the previous year.
total payment amount P = sum of non-discretionary expenses in the current year plus the previous year's taxes.  Calculate the amount of expense events in a similar way as calculating the amount of income events.
total withdrawal amount W = P - (amount of cash)
Iterate over investments in the expense withdrawal strategy, selling them one by one, until the total amount sold equals W.  The last investment to be sold might be partially sold.
For each sale, compute the capital gain, and update running total curYearGains of capital gains, if the sold investment's tax status is not "pre-tax retirement".  If the entire investment is sold, capital gain = current value - purchase price, where purchase price = sum of the amounts of purchases of this investment plus the initial value at the start of the simulation.  Note that the purchase price must be stored, and updated upon each purchase.  If a fraction f of an investment is sold, then capital gain = f * (current value - purchase price).   
Note that the capital "gain" may be negative (i.e., a loss), and that capital gains tax is paid on the net capital gain for the year.   Note that capital gains in pre-tax retirement accounts are taxed as regular income upon withdrawal from the pre-tax retirement account.
Update running total curYearIncome, if the investment sold is held in a pre-tax retirement account.  This reflects that we are both selling the investment and withdrawing the funds from the pre-tax retirement account in order to pay the expense.
Update running total curYearEarlyWithdrawals, if the investment sold is held in a pre-tax or after-tax retirement account and the user's age is less than 59.  If the user's age equals 59, we assume they perform this withdrawal after they turn 59½.


Pay discretionary expenses in the order given by the spending strategy, except stop if continuing would reduce the user's total assets below the financial goal.  The last discretionary expense to be paid can be partially paid, if incurring the entire expense would violate the financial goal.  Perform additional withdrawals if needed to pay them.
Details are similar to the details of paying non-discretionary expenses.


请你假设payMandatoryExpense 完全正确
 * TODO: need investgate! 
 */

import { SimulationState } from "./SimulationState";
import {
  SpendingEvent,
  withdraw_from_investments,
  calculate_detailed_expense_amount,
  sort_expenses_by_strategy,
} from "./ExpenseHelper";
import { TaxStatus } from "../Enums";

/**
 * 思考： 如果我是simulation的话，我在simulation开始就支付上一年的税款，这样不就保证了我剩下的现金一定是干净的了么？
 * 那么我可以随意拿取我想要的资金，并且随意的使用，因为即使破坏了也是破坏的下一年的financial goal，而不是当前的financial goal。
 * 那么扣税导致的financial goal被破坏就不是我需要担心的问题了。
 */


/**
 * 计算当前的现金和投资的价值
 * @param state The simulation state
 * @returns The total value of cash and investments
 */
function calculate_current_assets(state: SimulationState): {
  cashValue: number;
  non_retirement_accounts_value: number;
  pre_tax_retirement_accounts_value: number;
  after_tax_retirement_accounts_value: number;
} {
  let cashValue = state.cash.get_value();
  let non_retirement_accounts_value = 0;
  let pre_tax_retirement_accounts_value = 0;
  let after_tax_retirement_accounts_value = 0;

  for (const [_, investment] of state.accounts.non_retirement) {
    non_retirement_accounts_value += investment.get_value();
  }

  for (const [_, investment] of state.accounts.pre_tax) {
    pre_tax_retirement_accounts_value += investment.get_value();
  }

  for (const [_, investment] of state.accounts.after_tax) {
    after_tax_retirement_accounts_value += investment.get_value();
  }

  return {
    cashValue,
    non_retirement_accounts_value,
    pre_tax_retirement_accounts_value,
    after_tax_retirement_accounts_value,
  };
}

/**
 * Process discretionary expense events for the current year, respecting the financial goal
 * ! 这里不再返回true或者false，而是直接修改state，因为我们完全可以不支付任何discretionary expense。
 *! 我们在这里假定拿到的discretionaryExpenses是已经按照spending strategy排序好的。
 * @param state The current simulation state
 * @returns void
 */
export function pay_discretionary_expenses(state: SimulationState): void {
  // SEQUENTIAL THINKING STEP 1: Get discretionary expenses for the current year
  const currentYear = state.get_current_year();
  const discretionaryExpenses = state.get_discretionary_expenses();

  //检查是否存在discretionaryExpenses
  if (discretionaryExpenses.length === 0) {
    return;
  }

  //获得当前的现金和投资的价值
  let {
    cashValue,
    non_retirement_accounts_value,
    pre_tax_retirement_accounts_value,
    after_tax_retirement_accounts_value,
  } = calculate_current_assets(state);

  const financial_goal = state.get_financial_goal();

  //计算离打破financial goal还差多少钱
  const available_amount = financial_goal - (cashValue + non_retirement_accounts_value + pre_tax_retirement_accounts_value + after_tax_retirement_accounts_value);

  if (available_amount <= 0) {
    return;
  }

  // SEQUENTIAL THINKING STEP 4: Process each expense in order
  for (const expense of discretionaryExpenses) {
    // Calculate the expense amount for this year
    const expenseAmount = calculate_detailed_expense_amount(
      expense,
      currentYear,
      state.inflation_factor
    );

    if (expenseAmount <= 0) continue; // Skip zero-amount expenses

    //计算支付当前discretionary expense需要的资金
    //如果remain_amount大于0，那么就支付当前discretionary expense
    const remain_amount = available_amount - expenseAmount;

    //todo: 未完成，需要思考。3月25日
    //如果支付当前discretionary expense需要的资金大于0，就表示我可以支付当前discretionary expense
    if (remain_amount > 0) {
      //表示可以完全支付当前discretionary expense
      //那么首先检查自己有没有足够的现金
      if (cashValue >= expenseAmount) {
        //那么就从cashValue中扣除expenseAmount
        cashValue -= expenseAmount;
      } else if (non_retirement_accounts_value+cashValue >= expenseAmount) {
        //先从cash中支付所有cashValue
        cashValue = 0;
        //然后从non_retirement_accounts_value中扣除expenseAmount
        non_retirement_accounts_value -= expenseAmount - cashValue;
      } else {
        //那么就从pre_tax_retirement_accounts_value中扣除expenseAmount
        pre_tax_retirement_accounts_value -= expenseAmount;
      }
    }

  }
}
