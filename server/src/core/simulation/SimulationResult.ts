import { SimulationYearlyResult, YearResult } from "./SimulationYearlyResult"

//! TODO: this the shitty code that need to be work on
// this is Haifeng's code
// Define the shape of the consolidated simulation result that will be returned to frontend/database
//add the simulation count to the consolidated result
// the medianAndAverageValues is the median and average values of the simulation results, and it show be shown inside the yearlyData, median and
export interface ConsolidatedResult {
  scenarioId: string;
  successProbability: number;
  startYear: number;
  endYear: number;
  
  // Year-based data structure
  yearlyData: Array<{
    year: number;
    
    // Investment data
    total_after_tax: number;
    total_pre_tax: number;
    total_non_retirement: number;
    is_goal_met: boolean;
    cash_value: number;
    investments: Record<string, number>;
    
    // Income data 
    cur_year_income: number;
    cur_year_social_security: number;
    cur_year_capital_gains: number;
    cur_year_after_tax_contributions: number;
    cur_year_early_withdrawals: number;
    income_breakdown: Record<string, number>;
    
    // Expense data
    mandatory_expenses: number;
    discretionary_expenses: number;
    total_expenses: number;
    expense_breakdown: {
      expenses: Record<string, number>;
      taxes: number;
    };
    
    // Statistical data (if this year has data from multiple simulations)
    stats?: {
      totalInvestments?: {
        median: number;
        ranges: {
          range10_90: [number, number];
          range20_80: [number, number];
          range30_70: [number, number];
          range40_60: [number, number];
        }
      };
      totalIncome?: {
        median: number;
        ranges: {
          range10_90: [number, number];
          range20_80: [number, number];
          range30_70: [number, number];
          range40_60: [number, number];
        }
      };
      totalExpenses?: {
        median: number;
        ranges: {
          range10_90: [number, number];
          range20_80: [number, number];
          range30_70: [number, number];
          range40_60: [number, number];
        }
      };
      earlyWithdrawalTax?: {
        median: number;
        ranges: {
          range10_90: [number, number];
          range20_80: [number, number];
          range30_70: [number, number];
          range40_60: [number, number];
        }
      };
      discretionaryExpensesPct?: {
        median: number;
        ranges: {
          range10_90: [number, number];
          range20_80: [number, number];
          range30_70: [number, number];
          range40_60: [number, number];
        }
      };
    };

    // Median and average values for this specific year
    medianValues?: {
      investments: Record<string, number>;
      income: Record<string, number>;
      expenses: Record<string, number>;
    };
    averageValues?: {
      investments: Record<string, number>;
      income: Record<string, number>;
      expenses: Record<string, number>;
    };
  }>;
  
  // New structure specifically for charts
  chartData?: {
    years: number[];
    medianValues: {
      investments: Array<{
        name: string;
        category: 'investment';
        taxStatus?: 'pre-tax' | 'after-tax' | 'non-retirement';
        values: number[];
      }>,
      income: Array<{
        name: string;
        category: 'income';
        values: number[];
      }>,
      expenses: Array<{
        name: string;
        category: 'expense';
        values: number[];
      }>
    },
    averageValues: {
      investments: Array<{
        name: string;
        category: 'investment';
        taxStatus?: 'pre-tax' | 'after-tax' | 'non-retirement';
        values: number[];
      }>,
      income: Array<{
        name: string;
        category: 'income';
        values: number[];
      }>,
      expenses: Array<{
        name: string;
        category: 'expense';
        values: number[];
      }>
    }
  };
  
  // Additional fields for probability of success
  probabilityOfSuccess?: { [year: number]: number };
  
  // Maps for frontend convenience
  investmentTaxStatusMap?: { [investmentName: string]: 'pre-tax' | 'after-tax' | 'non-retirement' };
}

// Define the shape of the SimulationResult object that is returned by create_simulation_result
export interface SimulationResult {
  scenarioId: string;
  yearlyResults: Array<YearResult>;
  successProbability: number;
  
  // Method to format results for frontend/database
  formatResults(): ConsolidatedResult;
}


export function create_simulation_result(
  simulation_yearly_result: SimulationYearlyResult,
  scenarioId: string,
  all_simulations?: SimulationYearlyResult[],
): SimulationResult {
  // Extract data from simulation_yearly_result
  const yearlyResults = simulation_yearly_result.yearly_results;
  const successProbability = simulation_yearly_result.success_probability();

  
  /**
   * Helper function to convert yearly results to a consolidated format
   * for both frontend charts and database storage
   */
  function formatResults(): ConsolidatedResult {
    // Extract years
    const years = yearlyResults.map(yr => yr.year);
    
    // Create yearlyData array
    const yearlyData = yearlyResults.map(yr => {
      // Create the base year data directly from YearResult
      const yearData = {
        year: yr.year,
        
        // Investment data
        total_after_tax: yr.total_after_tax,
        total_pre_tax: yr.total_pre_tax,
        total_non_retirement: yr.total_non_retirement,
        is_goal_met: yr.is_goal_met,
        cash_value: yr.cash_value,
        investments: yr.investments,
        
        // Income data
        cur_year_income: yr.cur_year_income,
        cur_year_social_security: yr.cur_year_social_security,
        cur_year_capital_gains: yr.cur_year_capital_gains,
        cur_year_after_tax_contributions: yr.cur_year_after_tax_contributions,
        cur_year_early_withdrawals: yr.cur_year_early_withdrawals,
        income_breakdown: yr.income_breakdown,
        
        // Expense data
        mandatory_expenses: yr.mandatory_expenses,
        discretionary_expenses: yr.discretionary_expenses,
        total_expenses: yr.total_expenses,
        expense_breakdown: yr.expense_breakdown,
      };
      
      // Add statistical data if we have multiple simulations
      if (all_simulations && all_simulations.length > 1) {
        // Find the index of this year in our simulation data
        const yearIndex = yearlyResults.findIndex(y => y.year === yr.year);
        
        if (yearIndex !== -1) {
          // Calculate statistics for this specific year across all simulations
          const yearStats = {
            totalInvestments: getYearStatistics(
              all_simulations, 
              yearIndex, 
              y => y.total_after_tax + y.total_pre_tax + y.total_non_retirement
            ),
            totalIncome: getYearStatistics(
              all_simulations,
              yearIndex,
              y => y.cur_year_income
            ),
            totalExpenses: getYearStatistics(
              all_simulations,
              yearIndex,
              y => y.total_expenses
            )
          };
          
          // Add stats to the year data
          return {
            ...yearData,
            stats: yearStats
          };
        }
      }
      
      return yearData;
    });
    
    // Create the consolidated result object
    return {
      scenarioId,
      successProbability,
      startYear: years[0],
      endYear: years[years.length - 1],
      yearlyData
    };
  }
  
  // Return the SimulationResult object
  return {
    scenarioId,
    yearlyResults,
    successProbability,
    formatResults
  };
}

// Function to calculate distribution ranges from multiple simulation results
// This would be used when we have multiple simulation runs
export function calculateDistributionRanges(
  simulationResults: SimulationYearlyResult[],
  valueSelector: (yearResult: YearResult) => number
): {
  median: number[];
  ranges: {
    range10_90: number[][];
    range20_80: number[][];
    range30_70: number[][];
    range40_60: number[][];
  }
} {
  // Assuming all simulations have the same number of years
  if (simulationResults.length === 0 || simulationResults[0].yearly_results.length === 0) {
    return {
      median: [],
      ranges: {
        range10_90: [[], []],
        range20_80: [[], []],
        range30_70: [[], []],
        range40_60: [[], []]
      }
    };
  }
  
  const yearCount = simulationResults[0].yearly_results.length;
  const medianValues: number[] = [];
  const ranges = {
    range10_90: [[] as number[], [] as number[]],
    range20_80: [[] as number[], [] as number[]],
    range30_70: [[] as number[], [] as number[]],
    range40_60: [[] as number[], [] as number[]]
  };
  
  // For each year, calculate the distribution
  for (let yearIndex = 0; yearIndex < yearCount; yearIndex++) {
    // Get values from all simulations for this year
    const valuesForYear = simulationResults
      .map(sim => {
        const yearResult = sim.yearly_results[yearIndex];
        return yearResult ? valueSelector(yearResult) : 0;
      })
      .filter(val => !isNaN(val)); // Filter out NaN values
    
    if (valuesForYear.length === 0) {
      medianValues.push(0);
      ranges.range10_90[0].push(0);
      ranges.range10_90[1].push(0);
      ranges.range20_80[0].push(0);
      ranges.range20_80[1].push(0);
      ranges.range30_70[0].push(0);
      ranges.range30_70[1].push(0);
      ranges.range40_60[0].push(0);
      ranges.range40_60[1].push(0);
      continue;
    }
    
    // Sort values for calculations
    valuesForYear.sort((a, b) => a - b);
    
    // Calculate median directly from sorted array
    const median = calculateMedian(valuesForYear);
    medianValues.push(median);
    
    // Calculate percentile ranges without using quantile function
    const len = valuesForYear.length;
    
    // Calculate ranges by direct index into the sorted array
    ranges.range10_90[0].push(valuesForYear[Math.floor(len * 0.1)] || 0);
    ranges.range10_90[1].push(valuesForYear[Math.floor(len * 0.9)] || 0);
    
    ranges.range20_80[0].push(valuesForYear[Math.floor(len * 0.2)] || 0);
    ranges.range20_80[1].push(valuesForYear[Math.floor(len * 0.8)] || 0);
    
    ranges.range30_70[0].push(valuesForYear[Math.floor(len * 0.3)] || 0);
    ranges.range30_70[1].push(valuesForYear[Math.floor(len * 0.7)] || 0);
    
    ranges.range40_60[0].push(valuesForYear[Math.floor(len * 0.4)] || 0);
    ranges.range40_60[1].push(valuesForYear[Math.floor(len * 0.6)] || 0);
  }
  
  return {
    median: medianValues,
    ranges
  };
}

// Helper function to calculate median without d3-array
function calculateMedian(sortedValues: number[]): number {
  const len = sortedValues.length;
  if (len === 0) return 0;
  
  const mid = Math.floor(len / 2);
  
  if (len % 2 === 0) {
    // Even number of elements, average the middle two
    return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  } else {
    // Odd number of elements, return the middle one
    return sortedValues[mid];
  }
}

// Helper function to calculate statistics for a specific year across all simulations
function getYearStatistics(
  simulations: SimulationYearlyResult[],
  yearIndex: number,
  valueSelector: (yr: YearResult) => number
): {
  median: number;
  ranges: {
    range10_90: [number, number];
    range20_80: [number, number];
    range30_70: [number, number];
    range40_60: [number, number];
  }
} {
  // Get values for this year from all simulations
  const values = simulations
    .map(sim => {
      const yearResult = sim.yearly_results[yearIndex];
      return yearResult ? valueSelector(yearResult) : 0;
    })
    .filter(val => !isNaN(val));
  
  if (values.length === 0) {
    return {
      median: 0,
      ranges: {
        range10_90: [0, 0],
        range20_80: [0, 0],
        range30_70: [0, 0],
        range40_60: [0, 0]
      }
    };
  }
  
  // Sort values for calculations
  values.sort((a, b) => a - b);
  
  // Calculate median
  const median = calculateMedian(values);
  
  // Calculate percentile ranges
  const len = values.length;
  
  return {
    median,
    ranges: {
      range10_90: [
        values[Math.floor(len * 0.1)] || 0,
        values[Math.floor(len * 0.9)] || 0
      ],
      range20_80: [
        values[Math.floor(len * 0.2)] || 0,
        values[Math.floor(len * 0.8)] || 0
      ],
      range30_70: [
        values[Math.floor(len * 0.3)] || 0,
        values[Math.floor(len * 0.7)] || 0
      ],
      range40_60: [
        values[Math.floor(len * 0.4)] || 0,
        values[Math.floor(len * 0.6)] || 0
      ]
    }
  };
}

/**
 * Creates a consolidated simulation result from multiple simulations
 * This generates a single result object that matches the frontend requirements
 */
export function createConsolidatedSimulationResult(
  allSimulations: SimulationYearlyResult[],
  scenarioId: string
): ConsolidatedResult {
  if (!allSimulations || allSimulations.length === 0) {
    throw new Error("Cannot create consolidated result: No simulations provided");
  }
  
  // Use the first simulation to extract years (all simulations should have the same years)
  const firstSimulation = allSimulations[0];
  const yearlyResults = firstSimulation.yearly_results;
  const years = yearlyResults.map(yr => yr.year);
  const startYear = years[0];
  const endYear = years[years.length - 1];
  
  // Calculate overall success probability
  const successProbability = calculateOverallSuccessProbability(allSimulations);
  
  // Create year-by-year data
  const yearlyData = [];
  
  // Create data structures for frontend requirements
  const probabilityOfSuccess: { [year: number]: number } = {};
  const investmentTaxStatusMap: { [investmentName: string]: 'pre-tax' | 'after-tax' | 'non-retirement' } = {};
  
  // Process each year
  for (let yearIndex = 0; yearIndex < years.length; yearIndex++) {
    const year = years[yearIndex];
    
    // Get all results for this year across simulations
    const yearResults = allSimulations.map(sim => 
      sim.yearly_results[yearIndex]
    ).filter(yr => yr !== undefined);
    
    if (yearResults.length === 0) continue;
    
    // Calculate probability of success for this year
    const successCount = yearResults.filter(yr => yr.is_goal_met).length;
    const yearSuccessProbability = successCount / yearResults.length;
    probabilityOfSuccess[year] = yearSuccessProbability * 100; // Convert to percentage
    
    // Prepare median and average values for this year
    const medianInvestments: Record<string, number> = {};
    const averageInvestments: Record<string, number> = {};
    const medianIncome: Record<string, number> = {};
    const averageIncome: Record<string, number> = {};
    const medianExpenses: Record<string, number> = {};
    const averageExpenses: Record<string, number> = {};
    
    // Process investments
    const allInvestmentKeys = new Set<string>();
    yearResults.forEach(yr => {
      Object.keys(yr.investments).forEach(key => {
        allInvestmentKeys.add(key);
        
        // Determine tax status for investment
        if (!investmentTaxStatusMap[key]) {
          if (key.includes('pre-tax')) investmentTaxStatusMap[key] = 'pre-tax';
          else if (key.includes('after-tax')) investmentTaxStatusMap[key] = 'after-tax';
          else investmentTaxStatusMap[key] = 'non-retirement';
        }
      });
    });
    
    allInvestmentKeys.forEach(key => {
      const values = yearResults
        .map(yr => yr.investments[key] || 0)
        .filter(val => !isNaN(val));
      
      medianInvestments[key] = calculateMedian(values);
      averageInvestments[key] = calculateAverage(values);
    });
    
    // Process income
    const allIncomeKeys = new Set<string>();
    yearResults.forEach(yr => {
      Object.keys(yr.income_breakdown).forEach(key => {
        allIncomeKeys.add(key);
      });
    });
    
    allIncomeKeys.forEach(key => {
      const values = yearResults
        .map(yr => yr.income_breakdown[key] || 0)
        .filter(val => !isNaN(val));
      
      medianIncome[key] = calculateMedian(values);
      averageIncome[key] = calculateAverage(values);
    });
    
    // Process expenses
    const allExpenseKeys = new Set<string>();
    yearResults.forEach(yr => {
      if (yr.expense_breakdown && yr.expense_breakdown.expenses) {
        Object.keys(yr.expense_breakdown.expenses).forEach(key => {
          allExpenseKeys.add(key);
        });
      }
    });
    
    // Add taxes as an expense type
    allExpenseKeys.add('Taxes');
    
    allExpenseKeys.forEach(key => {
      let values: number[] = [];
      
      if (key === 'Taxes') {
        values = yearResults
          .map(yr => yr.expense_breakdown.taxes || 0)
          .filter(val => !isNaN(val));
      } else {
        values = yearResults
          .map(yr => yr.expense_breakdown.expenses?.[key] || 0)
          .filter(val => !isNaN(val));
      }
      
      medianExpenses[key] = calculateMedian(values);
      averageExpenses[key] = calculateAverage(values);
    });
    
    // Calculate statistics for this year
    const yearData = {
      year,
      
      // Investment data - using MEDIAN values
      total_after_tax: calculateMedian(yearResults.map(yr => yr.total_after_tax)),
      total_pre_tax: calculateMedian(yearResults.map(yr => yr.total_pre_tax)),
      total_non_retirement: calculateMedian(yearResults.map(yr => yr.total_non_retirement)),
      is_goal_met: yearSuccessProbability > 0.5, // true if more than 50% of simulations met the goal
      cash_value: calculateMedian(yearResults.map(yr => yr.cash_value)),
      
      // Create merged investment map with median values
      investments: createMergedRecordWithMedian(yearResults, 'investments'),
      
      // Income data - using MEDIAN values
      cur_year_income: calculateMedian(yearResults.map(yr => yr.cur_year_income)),
      cur_year_social_security: calculateMedian(yearResults.map(yr => yr.cur_year_social_security)),
      cur_year_capital_gains: calculateMedian(yearResults.map(yr => yr.cur_year_capital_gains)),
      cur_year_after_tax_contributions: calculateMedian(yearResults.map(yr => yr.cur_year_after_tax_contributions)),
      cur_year_early_withdrawals: calculateMedian(yearResults.map(yr => yr.cur_year_early_withdrawals)),
      income_breakdown: createMergedRecordWithMedian(yearResults, 'income_breakdown'),
      
      // Expense data - using MEDIAN values
      mandatory_expenses: calculateMedian(yearResults.map(yr => yr.mandatory_expenses)),
      discretionary_expenses: calculateMedian(yearResults.map(yr => yr.discretionary_expenses)),
      total_expenses: calculateMedian(yearResults.map(yr => yr.total_expenses)),
      expense_breakdown: {
        expenses: createMergedRecordWithMedian(yearResults, 'expense_breakdown.expenses'),
        taxes: calculateMedian(yearResults.map(yr => yr.expense_breakdown.taxes))
      },
      
      // Add statistical data
      stats: {
        totalInvestments: getYearStatistics(
          allSimulations, 
          yearIndex, 
          y => y.total_after_tax + y.total_pre_tax + y.total_non_retirement
        ),
        totalIncome: getYearStatistics(
          allSimulations,
          yearIndex,
          y => y.cur_year_income
        ),
        totalExpenses: getYearStatistics(
          allSimulations,
          yearIndex,
          y => y.total_expenses
        ),
        // Add early withdrawal tax statistics
        earlyWithdrawalTax: getYearStatistics(
          allSimulations,
          yearIndex,
          y => y.cur_year_early_withdrawals * 0.1 // 10% tax on early withdrawals
        ),
        //not sure if we use 10% tax on early withdrawals or not ???
        // Add discretionary expenses percentage statistics
        discretionaryExpensesPct: getYearStatistics(
          allSimulations,
          yearIndex,
          y => {
            // Calculate percentage of discretionary expenses
            return y.total_expenses > 0 
              ? (y.discretionary_expenses / y.total_expenses) * 100 
              : 0;
          }
        )
      },
      
      // Add median and average values for this specific year
      medianValues: {
        investments: medianInvestments,
        income: medianIncome,
        expenses: medianExpenses
      },
      averageValues: {
        investments: averageInvestments,
        income: averageIncome,
        expenses: averageExpenses
      }
    };
    
    // Add to yearlyData
    yearlyData.push(yearData);
  }
  
  // Create the consolidated result
  const consolidatedResult: ConsolidatedResult = {
    scenarioId,
    successProbability,
    startYear,
    endYear,
    yearlyData,
    probabilityOfSuccess,
    investmentTaxStatusMap
  };
  
  // Generate chart-friendly data structure
  consolidatedResult.chartData = {
    years,
    medianValues: {
      investments: generateInvestmentChartData(years, yearlyData, 'medianValues', investmentTaxStatusMap),
      income: generateIncomeChartData(years, yearlyData, 'medianValues'),
      expenses: generateExpenseChartData(years, yearlyData, 'medianValues')
    },
    averageValues: {
      investments: generateInvestmentChartData(years, yearlyData, 'averageValues', investmentTaxStatusMap),
      income: generateIncomeChartData(years, yearlyData, 'averageValues'),
      expenses: generateExpenseChartData(years, yearlyData, 'averageValues')
    }
  };
  
  return consolidatedResult;
}

/**
 * Calculate the overall success probability from all simulations
 */
function calculateOverallSuccessProbability(simulations: SimulationYearlyResult[]): number {
  if (!simulations || simulations.length === 0) return 0;
  
  // A simulation is successful if it met the goal in the final year
  const successfulSimulations = simulations.filter(sim => {
    const lastYearIndex = sim.yearly_results.length - 1;
    return lastYearIndex >= 0 && sim.yearly_results[lastYearIndex].is_goal_met;
  }).length;
  
  return successfulSimulations / simulations.length;
}

/**
 * Helper function to calculate the average of an array of numbers
 */
function calculateAverage(values: number[]): number {
  if (!values || values.length === 0) return 0;
  
  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
}

/**
 * Helper function to create a merged record with median values
 */
function createMergedRecordWithMedian(yearResults: YearResult[], propertyPath: string): Record<string, number> {
  // Get all unique keys across all records
  const allKeys = new Set<string>();
  
  // Handle nested properties (like 'expense_breakdown.expenses')
  const parts = propertyPath.split('.');
  
  yearResults.forEach(yr => {
    let value = yr as any;
    
    // Navigate to the nested property if necessary
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        value = undefined;
        break;
      }
    }
    
    // Add all keys from this record
    if (value && typeof value === 'object') {
      Object.keys(value).forEach(key => allKeys.add(key));
    }
  });
  
  // Create a merged record with median values
  const mergedRecord: Record<string, number> = {};
  
  allKeys.forEach(key => {
    const values: number[] = [];
    
    yearResults.forEach(yr => {
      let value = yr as any;
      
      // Navigate to the nested property
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          value = undefined;
          break;
        }
      }
      
      // Add value for this key if it exists
      if (value && typeof value === 'object' && key in value) {
        values.push(value[key]);
      }
    });
    
    // Use median for this key
    if (values.length > 0) {
      mergedRecord[key] = calculateMedian(values);
    }
  });
  
  return mergedRecord;
}

// Helper function for investment chart data - now works with yearly data array
function generateInvestmentChartData(
  years: number[],
  yearlyData: Array<any>,
  valueType: 'medianValues' | 'averageValues',
  taxStatusMap?: { [name: string]: 'pre-tax' | 'after-tax' | 'non-retirement' }
): Array<{
  name: string;
  category: 'investment';
  taxStatus?: 'pre-tax' | 'after-tax' | 'non-retirement';
  values: number[];
}> {
  // Get all unique investment names across all years
  const allNames = new Set<string>();
  yearlyData.forEach(yearData => {
    if (yearData[valueType] && yearData[valueType].investments) {
      Object.keys(yearData[valueType].investments).forEach(name => {
        allNames.add(name);
      });
    }
  });
  
  // Generate the array of chart items
  return Array.from(allNames).map(name => {
    const chartItem: {
      name: string;
      category: 'investment';
      taxStatus?: 'pre-tax' | 'after-tax' | 'non-retirement';
      values: number[];
    } = {
      name,
      category: 'investment',
      values: years.map(year => {
        // Find the yearData for this year
        const yearData = yearlyData.find(yd => yd.year === year);
        // Get value for this investment, or 0 if not present
        return yearData && 
               yearData[valueType] && 
               yearData[valueType].investments && 
               yearData[valueType].investments[name] || 0;
      })
    };
    
    // Add tax status for investments if available
    if (taxStatusMap && taxStatusMap[name]) {
      chartItem.taxStatus = taxStatusMap[name];
    }
    
    return chartItem;
  });
}

// Helper function for income chart data - now works with yearly data array
function generateIncomeChartData(
  years: number[],
  yearlyData: Array<any>,
  valueType: 'medianValues' | 'averageValues'
): Array<{
  name: string;
  category: 'income';
  values: number[];
}> {
  // Get all unique income source names across all years
  const allNames = new Set<string>();
  yearlyData.forEach(yearData => {
    if (yearData[valueType] && yearData[valueType].income) {
      Object.keys(yearData[valueType].income).forEach(name => {
        allNames.add(name);
      });
    }
  });
  
  // Generate the array of chart items
  return Array.from(allNames).map(name => ({
    name,
    category: 'income',
    values: years.map(year => {
      // Find the yearData for this year
      const yearData = yearlyData.find(yd => yd.year === year);
      // Get value for this income source, or 0 if not present
      return yearData && 
             yearData[valueType] && 
             yearData[valueType].income && 
             yearData[valueType].income[name] || 0;
    })
  }));
}

// Helper function for expense chart data - now works with yearly data array
function generateExpenseChartData(
  years: number[],
  yearlyData: Array<any>,
  valueType: 'medianValues' | 'averageValues'
): Array<{
  name: string;
  category: 'expense';
  values: number[];
}> {
  // Get all unique expense type names across all years
  const allNames = new Set<string>();
  yearlyData.forEach(yearData => {
    if (yearData[valueType] && yearData[valueType].expenses) {
      Object.keys(yearData[valueType].expenses).forEach(name => {
        allNames.add(name);
      });
    }
  });
  
  // Generate the array of chart items
  return Array.from(allNames).map(name => ({
    name,
    category: 'expense',
    values: years.map(year => {
      // Find the yearData for this year
      const yearData = yearlyData.find(yd => yd.year === year);
      // Get value for this expense type, or 0 if not present
      return yearData && 
             yearData[valueType] && 
             yearData[valueType].expenses && 
             yearData[valueType].expenses[name] || 0;
    })
  }));
}