import { SimulationYearlyResult } from "./SimulationYearlyResult";
import { simulation_logger } from "../../utils/logger/logger";

//TODO: 这里开始都可以被移走到另一个专门管理simulation result的文件
// AI-generated code
// Generic event interface for income, expense and investment
export interface Event {
  name: string;
  mean: number;
  median: number;
}

export type AllIncomeEvent = Array<Event>;
export type AllExpenseEvent = Array<Event>;
export type AllInvestment = Array<Event>;

export interface yearly_result {
  year: number;
  success_probability: number;
  all_income_event: AllIncomeEvent;
  all_expense_event: AllExpenseEvent;
  all_investment: AllInvestment;
  total_investment: shaded_chart;
  total_income: shaded_chart;
  total_expense: shaded_chart;
  total_early_withdrawal_tax: shaded_chart;
  total_discretionary_expenses_pct: shaded_chart;
}

export interface shaded_chart {
  median: number;
  ranges: {
    range10_90: [number, number];
    range20_80: [number, number];
    range30_70: [number, number];
    range40_60: [number, number];
  };
}

export interface simulation_result {
  scenarioId: string;
  seed: string;
  run_count: number;
  yearly_results: Array<yearly_result>;
}
//到这里为止，可以被移走到另一个专门管理simulation result的文件

function calculate_success_probability(
  allSimulations: SimulationYearlyResult[],
  loop_for_year: number
): number {
  let success_probability = 0;
  for (let i = 0; i < allSimulations.length; i++) {
    if (allSimulations[i].yearly_results[loop_for_year].is_goal_met) {
      success_probability++;
    }
  }
  return success_probability / allSimulations.length;
}

/**
 * Calculate mean from an array of number values
 * @param values Array of numbers to calculate statistics from
 * @returns Mean value
 */
// AI-generated code
// Function to calculate mean from array of values
function calculate_mean(values: number[]): number {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return values.length > 0 ? sum / values.length : 0;
}

/**
 * Calculate median from an array of number values
 * @param values Array of numbers to calculate statistics from
 * @returns Median value
 */
// AI-generated code
// Function to calculate median from array of values
function calculate_median(values: number[]): number {
  const sorted_values = [...values].sort((a, b) => a - b);
  let median = 0;

  if (sorted_values.length > 0) {
    const mid = Math.floor(sorted_values.length / 2);
    median =
      sorted_values.length % 2 === 0
        ? (sorted_values[mid - 1] + sorted_values[mid]) / 2
        : sorted_values[mid];
  }

  return median;
}

/**
 * Calculate percentile ranges for a sorted array of values
 * @param sorted_values Sorted array of number values
 * @returns Object containing the calculated percentile ranges
 */
// AI-generated code
// Function to calculate percentile ranges from a sorted array
function calculate_percentile_ranges(sorted_values: number[]): {
  range10_90: [number, number];
  range20_80: [number, number];
  range30_70: [number, number];
  range40_60: [number, number];
} {
  const len = sorted_values.length;

  if (len === 0) {
    return {
      range10_90: [0, 0],
      range20_80: [0, 0],
      range30_70: [0, 0],
      range40_60: [0, 0],
    };
  }

  return {
    range10_90: [
      sorted_values[Math.floor(len * 0.1)] || 0,
      sorted_values[Math.floor(len * 0.9)] || 0,
    ],
    range20_80: [
      sorted_values[Math.floor(len * 0.2)] || 0,
      sorted_values[Math.floor(len * 0.8)] || 0,
    ],
    range30_70: [
      sorted_values[Math.floor(len * 0.3)] || 0,
      sorted_values[Math.floor(len * 0.7)] || 0,
    ],
    range40_60: [
      sorted_values[Math.floor(len * 0.4)] || 0,
      sorted_values[Math.floor(len * 0.6)] || 0,
    ],
  };
}

function shaded_chart_from_array(array: number[]): shaded_chart {
  const median = calculate_median(array);
  const range10_90 = calculate_percentile_ranges(array).range10_90;
  const range20_80 = calculate_percentile_ranges(array).range20_80;
  const range30_70 = calculate_percentile_ranges(array).range30_70;
  const range40_60 = calculate_percentile_ranges(array).range40_60;

  return { median, ranges: { range10_90, range20_80, range30_70, range40_60 } };
}

/**
 * Generic function to calculate events with mean and median
 * @param allSimulations All simulation results
 * @param loop_for_year Current year index
 * @param fieldName The field name in YearResult to extract data from
 * @returns Array of events with name, mean and median
 */
// AI-generated code
// Generic function to calculate different types of events (income, expense, investment)
function calculate_events(
  allSimulations: SimulationYearlyResult[],
  loop_for_year: number,
  fieldName:
    | "income_breakdown"
    | "mandatory_expenses"
    | "discretionary_expenses"
    | "investments"
): Array<Event> {
  let events: Record<string, number>[] = [];

  // Extract data based on event type
  for (let i = 0; i < allSimulations.length; i++) {
    if (allSimulations[i].yearly_results[loop_for_year] != undefined) {
      const yearResult = allSimulations[i].yearly_results[loop_for_year];
      const data = yearResult[fieldName];
      if (data) {
        events.push(data);
      }
    }
  }

  // Create a record to hold all values for each event name
  const event_values: Record<string, number[]> = {};

  // Collect all values for each event name
  for (const simulation of events) {
    for (const event_name in simulation) {
      if (!event_values[event_name]) {
        event_values[event_name] = [];
      }
      event_values[event_name].push(simulation[event_name]);
    }
  }

  // Calculate median and mean for each event name
  const result: Array<Event> = [];

  for (const event_name in event_values) {
    const values = event_values[event_name];

    // Calculate mean and median using separate functions
    const mean = calculate_mean(values);
    const median = calculate_median(values);

    // Add each event to the result array with its name
    result.push({
      name: event_name,
      median,
      mean,
    });
  }

  return result;
}

/**
 * Helper function for income events
 */
function calculate_income_event(
  allSimulations: SimulationYearlyResult[],
  loop_for_year: number
): AllIncomeEvent {
  return calculate_events(allSimulations, loop_for_year, "income_breakdown");
}

function calculate_shaded_chart(
  allSimulations: SimulationYearlyResult[],
  loop_for_year: number,
  fieldName: string
): shaded_chart {
  //TODO: 首先，抓取所有simulation的fieldName（这里第一个抓取的是invest）
  //TODO：investment会得到一个array，array的每个元素是一个object，object的key是investment的name，value是investment的value
  //TODO：把所有数字加起来，得到一个total。这是一个simulation的total
  //TODO：创建一个array，接受所有simulation的total，然后从小到大排列
  //TODO：计算median，计算range10_90，range20_80，range30_70，range40_60
  //TODO：返回一个object，object的key是median，value是range10_90，range20_80，range30_70，range40_60

  const values: number[] = [];

  for (let i = 0; i < allSimulations.length; i++) {
    if (allSimulations[i].yearly_results[loop_for_year] != undefined) {
      const yearResult = allSimulations[i].yearly_results[loop_for_year];
      const data = yearResult[fieldName as keyof typeof yearResult];

      if (data && typeof data === "object") {
        // Sum all values in the object
        const total = Object.values(data as Record<string, number>).reduce(
          (sum, val) => sum + val,
          0
        );
        values.push(total);
      }
    }
  }

  // Sort values for percentile calculations
  const sorted_values = [...values].sort((a, b) => a - b);

  //! should make a function that return the shaded_chart
  return shaded_chart_from_array(sorted_values);
}

/**
 * Helper function for expense events - combines mandatory and discretionary expenses
 */
function calculate_expense_event(
  allSimulations: SimulationYearlyResult[],
  loop_for_year: number
): AllExpenseEvent {
  const mandatory = calculate_events(
    allSimulations,
    loop_for_year,
    "mandatory_expenses"
  );
  const discretionary = calculate_events(
    allSimulations,
    loop_for_year,
    "discretionary_expenses"
  );
  return [...mandatory, ...discretionary];
}

function calculate_total_income(
  allSimulations: SimulationYearlyResult[],
  loop_for_year: number
): shaded_chart {
  return calculate_shaded_chart(
    allSimulations,
    loop_for_year,
    "income_breakdown"
  );
}

/**
 * Helper function for investment events
 */
function calculate_investment_event(
  allSimulations: SimulationYearlyResult[],
  loop_for_year: number
): AllInvestment {
  return calculate_events(allSimulations, loop_for_year, "investments");
}

function calculate_total_investment(
  allSimulations: SimulationYearlyResult[],
  loop_for_year: number
): shaded_chart {
  return calculate_shaded_chart(allSimulations, loop_for_year, "investments");
}

/**
 * Helper function for expense events - combines mandatory and discretionary expenses
 */
function calculate_total_expense(
  allSimulations: SimulationYearlyResult[],
  loop_for_year: number
): { sorted_values: number[]; sorted_discretionary_percentage: number[] } {
  const values: number[] = [];
  const discretionary_percentage: number[] = [];
  for (let i = 0; i < allSimulations.length; i++) {
    if (allSimulations[i].yearly_results[loop_for_year] != undefined) {
      const yearResult = allSimulations[i].yearly_results[loop_for_year];
      const mandatoryExpensesTotal = Object.values(
        yearResult.mandatory_expenses
      ).reduce((sum, val) => sum + val, 0);
      const discretionaryExpensesTotal = Object.values(
        yearResult.discretionary_expenses
      ).reduce((sum, val) => sum + val, 0);
      const total = mandatoryExpensesTotal + discretionaryExpensesTotal;
      values.push(total);
      const percentage = discretionaryExpensesTotal / total;
      discretionary_percentage.push(percentage);
    }
  }
  // Sort values for percentile calculations
  const sorted_values = [...values].sort((a, b) => a - b);
  const sorted_discretionary_percentage = [...discretionary_percentage].sort(
    (a, b) => a - b
  );
  return { sorted_values, sorted_discretionary_percentage };
}

function calculate_total_early_withdrawal_tax(
  allSimulations: SimulationYearlyResult[],
  loop_for_year: number
): shaded_chart {
  return calculate_shaded_chart(
    allSimulations,
    loop_for_year,
    "cur_year_early_withdrawals"
  );
}

export function create_simulation_result_v1(
  allSimulations: SimulationYearlyResult[],
  seed: string,
  scenarioId: string
): simulation_result {
  if (!allSimulations || allSimulations.length === 0) {
    throw new Error(
      "Cannot create consolidated result: No simulations provided"
    );
  }
  simulation_logger.info(`Now you are in consolidatedSimulationResult`);
  //all simulation should give us how many simulations we have
  simulation_logger.debug(`allSimulations length is: ${allSimulations.length}`);

  const yearly_simulation_results: simulation_result = {
    scenarioId: scenarioId,
    seed: seed,
    run_count: allSimulations.length,
    yearly_results: [],
  };

  //TODO: 获得开始年份和结束年份
  const begining_year = allSimulations[0].yearly_results[0].year; // since all simulation should have the same begining year
  let end_year = 0;
  //using a for loop to find the longest yearly_results array
  let longest_yearly_results = 0;
  for (let i = 0; i < allSimulations.length; i++) {
    if (allSimulations[i].yearly_results.length > longest_yearly_results) {
      longest_yearly_results = allSimulations[i].yearly_results.length;
      end_year =
        allSimulations[i].yearly_results[longest_yearly_results - 1].year;
    }
  }
  simulation_logger.debug(`begining year is: ${begining_year}`);
  simulation_logger.debug(`end year is: ${end_year}`);

  //TODO:计算每年的simulation的所有需要的信息
  for (
    let loop_for_year = 0;
    loop_for_year < end_year - begining_year + 1;
    loop_for_year++
  ) {
    let curr_year = 0;
    let success_probability = 0;
    let all_income_event: AllIncomeEvent = [];
    let all_expense_event: AllExpenseEvent = [];
    let all_investment: AllInvestment = [];
    let total_investment: shaded_chart;
    let total_income: shaded_chart;
    let total_expense: shaded_chart;
    let total_early_withdrawal_tax: shaded_chart;
    let total_discretionary_expenses_pct: shaded_chart;
    //TODO:1 写入今年年份
    curr_year = begining_year + loop_for_year;
    simulation_logger.debug(`curr_year is: ${curr_year}`);

    //TODO:2 计算每年成功概率
    success_probability = calculate_success_probability(
      allSimulations,
      loop_for_year
    );
    simulation_logger.silly(
      `success_probability for year ${curr_year} is: ${success_probability}`
    );

    //TODO: 3. 每年的income event
    //TODO: 3.1 得到我们都有什么income event
    //TODO: 3.2 得到每个income event的median和mean
    all_income_event = calculate_income_event(allSimulations, loop_for_year);
    simulation_logger.silly(
      `all_income_event is: ${JSON.stringify(all_income_event, null, 2)}`
    );

    //TODO: 4. 每年的expense event
    all_expense_event = calculate_expense_event(allSimulations, loop_for_year);
    simulation_logger.silly(
      `all_expense_event is: ${JSON.stringify(all_expense_event, null, 2)}`
    );

    //TODO: 5. 每年的investment event
    all_investment = calculate_investment_event(allSimulations, loop_for_year);
    simulation_logger.silly(
      `all_investment is: ${JSON.stringify(all_investment, null, 2)}`
    );

    //TODO 6： 计算阴影部分：
    //TODO 6.1 计算total_investment
    total_investment = calculate_total_investment(
      allSimulations,
      loop_for_year
    );
    simulation_logger.silly(
      `total_investment is: ${JSON.stringify(total_investment, null, 2)}`
    );

    //TODO 6.2 计算total_income
    total_income = calculate_total_income(allSimulations, loop_for_year);
    simulation_logger.silly(
      `total_income is: ${JSON.stringify(total_income, null, 2)}`
    );

    //TODO 6.3 计算total_expense

    const {
      sorted_values: total_expense_array,
      sorted_discretionary_percentage: total_discretionary_percentage,
    } = calculate_total_expense(allSimulations, loop_for_year);
    simulation_logger.silly(
      `total_expense_array is: ${JSON.stringify(total_expense_array, null, 2)}`
    );

    //TODO:计算出shaded_chart
    total_expense = shaded_chart_from_array(total_expense_array);
    simulation_logger.silly(
      `total_expense is: ${JSON.stringify(total_expense, null, 2)}`
    );

    //TODO6.4 计算出total_discretionary_expenses_pct
    total_discretionary_expenses_pct = shaded_chart_from_array(
      total_discretionary_percentage
    );
    simulation_logger.silly(
      `total_discretionary_expenses_pct is: ${JSON.stringify(
        total_discretionary_expenses_pct,
        null,
        2
      )}`
    );

    //TODO 6.5 计算total_early_withdrawal_tax
    total_early_withdrawal_tax = calculate_total_early_withdrawal_tax(
      allSimulations,
      loop_for_year
    );
    simulation_logger.silly(
      `total_early_withdrawal_tax is: ${JSON.stringify(
        total_early_withdrawal_tax,
        null,
        2
      )}`
    );
    //TODO: 7. 写入yearly_results
    yearly_simulation_results.yearly_results.push({
      year: curr_year,
      success_probability: success_probability,
      all_income_event: all_income_event,
      all_expense_event: all_expense_event,
      all_investment: all_investment,
      total_investment: total_investment,
      total_income: total_income,
      total_expense: total_expense,
      total_early_withdrawal_tax: total_early_withdrawal_tax,
      total_discretionary_expenses_pct: total_discretionary_expenses_pct,
    });
  }
  return yearly_simulation_results;
}

/**
 * Temporary debug function to display the contents of a simulation result
 * @param result The simulation result to debug
 * @param verbose Whether to show all details or just summary
 */
// AI-generated code
// Function to debug and display simulation result contents
export function debug_simulation_result(
  result: simulation_result,
  verbose: boolean = false
): void {
  if (!result) {
    simulation_logger.error(
      "Empty simulation result provided to debug function"
    );
    return;
  }

  simulation_logger.info("=== SIMULATION RESULT DEBUG ===");
  simulation_logger.info(`Scenario ID: ${result.scenarioId}`);
  simulation_logger.info(`Seed: ${result.seed}`);
  simulation_logger.info(`Run Count: ${result.run_count}`);
  simulation_logger.info(`Years Count: ${result.yearly_results.length}`);

  if (verbose && result.yearly_results.length > 0) {
    // Sample first year
    const firstYear = result.yearly_results[0];
    simulation_logger.info("\nSample Year Data (First Year):");
    simulation_logger.info(`Year: ${firstYear.year}`);
    simulation_logger.info(
      `Success Probability: ${firstYear.success_probability}`
    );

    // Show income data
    simulation_logger.info("\nIncome Events Sample:");
    if (firstYear.all_income_event.length > 0) {
      firstYear.all_income_event.slice(0, 3).forEach((income) => {
        simulation_logger.info(
          `  - ${income.name}: mean=${income.mean}, median=${income.median}`
        );
      });

      if (firstYear.all_income_event.length > 3) {
        simulation_logger.info(
          `  - ... and ${
            firstYear.all_income_event.length - 3
          } more income events`
        );
      }
    } else {
      simulation_logger.info("  No income events found");
    }

    // Show expense data
    simulation_logger.info("\nExpense Events Sample:");
    if (firstYear.all_expense_event.length > 0) {
      firstYear.all_expense_event.slice(0, 3).forEach((expense) => {
        simulation_logger.info(
          `  - ${expense.name}: mean=${expense.mean}, median=${expense.median}`
        );
      });

      if (firstYear.all_expense_event.length > 3) {
        simulation_logger.info(
          `  - ... and ${
            firstYear.all_expense_event.length - 3
          } more expense events`
        );
      }
    } else {
      simulation_logger.info("  No expense events found");
    }

    // Show shaded chart data
    simulation_logger.info("\nTotal Investment (Shaded Chart):");
    simulation_logger.info(`  Median: ${firstYear.total_investment.median}`);
    simulation_logger.info(
      `  Range 10-90: [${firstYear.total_investment.ranges.range10_90[0]}, ${firstYear.total_investment.ranges.range10_90[1]}]`
    );

    simulation_logger.info("\nTotal Income (Shaded Chart):");
    simulation_logger.info(`  Median: ${firstYear.total_income.median}`);
    simulation_logger.info(
      `  Range 10-90: [${firstYear.total_income.ranges.range10_90[0]}, ${firstYear.total_income.ranges.range10_90[1]}]`
    );

    simulation_logger.info("\nTotal Expense (Shaded Chart):");
    simulation_logger.info(`  Median: ${firstYear.total_expense.median}`);
    simulation_logger.info(
      `  Range 10-90: [${firstYear.total_expense.ranges.range10_90[0]}, ${firstYear.total_expense.ranges.range10_90[1]}]`
    );
  }

  simulation_logger.info("=== END SIMULATION RESULT DEBUG ===");
}
