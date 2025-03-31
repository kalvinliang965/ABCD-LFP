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

import { SimulationState } from "../SimulationState";
import {
  SpendingEvent,
  withdraw_from_investments,
  calculate_detailed_expense_amount,
  sort_expenses_by_strategy,
} from "./ExpenseHelper";
import { TaxStatus } from "../../Enums";

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
  non_retirement_accounts_value: number;
  pre_tax_retirement_accounts_value: number;
  after_tax_retirement_accounts_value: number;
} {
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
  const discretionaryExpenses = state.discretionary_expenses;
  let cashValue = state.cash.get_value();

  //检查是否存在discretionaryExpenses
  if (discretionaryExpenses.length === 0) {
    return;
  }
  console.log("此时我们有这么多discretionaryExpenses", discretionaryExpenses);

  //获得当前的现金和投资的价值
  let {
    non_retirement_accounts_value,
    pre_tax_retirement_accounts_value,
    after_tax_retirement_accounts_value,
  } = calculate_current_assets(state);

  console.log(
    "此时我们一共有这么多钱",
    non_retirement_accounts_value +
      pre_tax_retirement_accounts_value +
      after_tax_retirement_accounts_value +
      cashValue
  );

  const financial_goal = state.get_financial_goal();
  console.log("此时我们的financial goal是", financial_goal);

  //计算离打破financial goal还差多少钱
  let available_amount =
    non_retirement_accounts_value +
    pre_tax_retirement_accounts_value +
    after_tax_retirement_accounts_value +
    cashValue -
    financial_goal;

  console.log("此时我们离打破financial goal还差多少钱", available_amount);

  //如果无论如何都会打破financial goal，那么就什么都不做
  if (available_amount <= 0) {
    return;
  }

  // SEQUENTIAL THINKING STEP 4: Process each expense in order
  for (const expense of discretionaryExpenses) {
    // Calculate the expense amount for this year
    console.log("此时我们正在尝试支付的discretionary expense是", expense);
    let expenseAmount = calculate_detailed_expense_amount(expense, currentYear);
    console.log("此时我们需要的discretionary expense是", expenseAmount);

    if (expenseAmount <= 0) continue; // 如果完全不同掏钱的活动就跳过。

    //如果无论如何都会打破financial goal，那么就什么都不做
    if (available_amount <= 0) {
      return;
    }

    //remain_amount 表示支付当前discretionary expense后，离打破financial goal还差多少钱,可以用于迭代下一个discretionary expense
    let remain_amount = available_amount - expenseAmount;
    console.log(
      "此时我们离打破financial goal还差多少钱 remain_amount",
      remain_amount
    );

    /**
     * 假设你离打破financial goal还差1000，但你需要支付的价格是1200.
     * 那么这个时候remain_amount = -200，表示你已经没有钱了，那么你就需要partial pay。
     */

    //检查是否需要partial pay
    if (remain_amount < 0) {
      //那么就partial pay
      expenseAmount = available_amount;
      remain_amount = 0;
    }

    available_amount = remain_amount;

    //此算到此，的expenseAmount 有两种情况
    // 1. expenseAmount就是event的金额
    // 2. expenseAmount是event的金额的一部分，因为需要partial pay
    // 但是无论是哪种情况，expenseAmount 都是当前需要支付的金额。

    //先尝试使用现金支付，这样不产生任何税款。
    //无论如何都先从cash中扣费。 不判断。但要确保cashValue !< 0

    //先计算可以从cash中拿到多少， cash_amount表示从cash中扣除的金额

    //假设cashValue = 1000， expenseAmount = 1200
    //那么cash_amount = 1000
    //那么expenseAmount = 200
    //表示我们还需要从其他地方获取200

    //假设2 cashvalue = 1200， expenseAmount = 1000
    //那么cash_amount = 1000
    //那么expenseAmount = 0
    //表示我们刚好支付了当前的discretionary expense

    console.log("此时我们正在尝试支付的discretionary expense是", expense);
    console.log("此时我们的cashValue是", cashValue);
    let cash_amount = Math.min(cashValue, expenseAmount);
    console.log("此时我们从cash中扣除的金额是", cash_amount);
    cashValue -= cash_amount;
    state.cash.incr_value(-cash_amount);
    console.log("此时我们的cashValue是", cashValue);
    console.log("此时我们state中的cash是", state.cash.get_value());
    expenseAmount -= cash_amount;
    console.log("此时剩余的expenseAmount是", expenseAmount);

    //这就表示，expenseAmount < 0的情况，cash可以完全支付当前的discretionary expense
    if (expenseAmount <= 0) continue;

    //1. cash此时为0，expenseAmount 此时表示需要从其他地方获取的资金
    //由于我们的if判断中保证了available_amount > 0，所以不会破坏财政计划，直接掏钱就好了。
    //也不存在unfunded的情况，因为已经检查过了partial pay的情况。

    const unfunded = withdraw_from_investments(state, expenseAmount);
    console.log("此时我们这个event的unfunded是", unfunded.unfunded);

    //更新当前这个event的amount
    expense.remaining_amount = unfunded.unfunded;

    //todo: 未完成，需要思考。3月25日
    //如果支付当前discretionary expense需要的资金大于0，就表示我可以支付当前discretionary expense
    //!当前实现方法有问题，我们需要从non retirement account中扣除，那么就说明我们需要遍历每一个investment event并更新。
    //? 是否可以使用helper 中的withdraw_from_investments 来实现？
    //* 使用cash时不需要缴税。
  }
}
