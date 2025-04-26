import { SimulationYearlyResult, YearResult } from "./SimulationYearlyResult"
import { quantile } from 'd3-array'; 

// Define the shape of the consolidated simulation result that will be returned to frontend/database
export interface ConsolidatedResult {
  scenarioId: string;
  successProbability: number;
  years: number[];
  startYear: number;
  endYear: number; //not sure if this is correct?
  //probability: number[];
  investments: Array<{
    name: string;
    category: 'investment';
    taxStatus?: 'non-retirement' | 'pre-tax' | 'after-tax';
    values: number[];
  }>;
  income: Array<{
    name: string;
    category: 'income';
    values: number[];
  }>;
  expenses: Array<{
    name: string;
    category: 'expense';
    values: number[];
  }>;
  totalInvestments?: {
    median: number[];
    ranges: {
      range10_90: number[][];
      range20_80: number[][];
      range30_70: number[][];
      range40_60: number[][];
    };
  };
  totalExpenses?: {
    median: number[];
    ranges: {
      range10_90: number[][];
      range20_80: number[][];
      range30_70: number[][];
      range40_60: number[][];
    };
  };
  totalIncome?: {
    median: number[];
    ranges: {
      range10_90: number[][];
      range20_80: number[][];
      range30_70: number[][];
      range40_60: number[][];
    };
  };
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
    // Extract years for all charts
    //edit: do we need to be using the start and end year from the simulation
    const years = yearlyResults.map(yr => yr.year);
    
    // 1. Probability of Success data
    const probability = yearlyResults.map(yr => yr.is_goal_met ? 100 : 0);
    
    // 2. Create data structure for investments, income, and expenses
    // Helper function to transform Record<string, number> to array format
    function convertRecordToDataItems<T extends 'investment' | 'income' | 'expense'>(
      sourceData: YearResult[],
      category: T,
      recordSelector: (yr: YearResult) => Record<string, number>
    ): Array<{
      name: string;
      category: T;
      taxStatus?: 'non-retirement' | 'pre-tax' | 'after-tax';
      values: number[];
    }> {
      // Get all unique keys across all years
      const allKeys = new Set<string>();
      sourceData.forEach(yr => {
        const record = recordSelector(yr);
        Object.keys(record).forEach(key => allKeys.add(key));
      });
      
      // Convert to array of DataItems
      return Array.from(allKeys).map(key => {
        // For investments, determine tax status based on key name
        let taxStatus: 'non-retirement' | 'pre-tax' | 'after-tax' | undefined;
        if (category === 'investment') {
          if (key.includes('pre-tax')) taxStatus = 'pre-tax';
          else if (key.includes('after-tax')) taxStatus = 'after-tax';
          else taxStatus = 'non-retirement';
        }
        
        return {
          name: key,
          category,
          taxStatus,
          values: years.map(year => {
            const yr = yearlyResults.find(y => y.year === year);
            return yr ? recordSelector(yr)[key] || 0 : 0;
          })
        };
      });
    }
    
    // Process investments with explicit 'investment' type
    const investments = convertRecordToDataItems(
      yearlyResults,
      'investment' as const,
      yr => yr.investments
    );
    
    // Process income with explicit 'income' type
    const income = convertRecordToDataItems(
      yearlyResults,
      'income' as const,
      yr => yr.income_breakdown
    );
    
    // Process expenses with explicit 'expense' type
    const expenses = convertRecordToDataItems(
      yearlyResults,
      'expense' as const,
      yr => ({
        ...yr.expense_breakdown.expenses,
        'Taxes': yr.expense_breakdown.taxes
      })
    );
    
    // 3. Create statistical ranges 
    // Calculate total investments for each year
    const totalInvestmentsValues = yearlyResults.map(yr => 
      yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement
    );
    
    // Use calculateDistributionRanges with all simulations if available
    const totalInvestments = all_simulations && all_simulations.length > 1
      ? calculateDistributionRanges(
          all_simulations,
          yr => yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement
        )
      : undefined;
    
    // Calculate for total income
    const totalIncomeValues = yearlyResults.map(yr => yr.cur_year_income);
    
    // Use calculateDistributionRanges with all simulations if available
    const totalIncome = all_simulations && all_simulations.length > 1
      ? calculateDistributionRanges(
          all_simulations,
          yr => yr.cur_year_income
        )
      : undefined;
    
    // Calculate for total expenses
    const totalExpensesValues = yearlyResults.map(yr => yr.total_expenses);
    
    // Use calculateDistributionRanges with all simulations if available
    const totalExpenses = all_simulations && all_simulations.length > 1
      ? calculateDistributionRanges(
          all_simulations,
          yr => yr.total_expenses
        )
      : undefined;
    
    // Create the consolidated result object
    return {
      scenarioId,
      successProbability,
      years,
      startYear: years[0],
      endYear: years[years.length - 1],//not sure if this is correct
      //probability,
      investments,
      income,
      expenses,
      ...(totalInvestments && { totalInvestments }),
      ...(totalIncome && { totalIncome }),
      ...(totalExpenses && { totalExpenses })
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
    
    // Sort values for percentile calculations
    valuesForYear.sort((a, b) => a - b);
    
    // Calculate median
    const median = valuesForYear.length > 0 
      ? quantile(valuesForYear, 0.5) || 0 
      : 0;
    medianValues.push(median);
    
    // Calculate percentile ranges
    ranges.range10_90[0].push(valuesForYear.length > 0 ? quantile(valuesForYear, 0.1) || 0 : 0);
    ranges.range10_90[1].push(valuesForYear.length > 0 ? quantile(valuesForYear, 0.9) || 0 : 0);
    
    ranges.range20_80[0].push(valuesForYear.length > 0 ? quantile(valuesForYear, 0.2) || 0 : 0);
    ranges.range20_80[1].push(valuesForYear.length > 0 ? quantile(valuesForYear, 0.8) || 0 : 0);
    
    ranges.range30_70[0].push(valuesForYear.length > 0 ? quantile(valuesForYear, 0.3) || 0 : 0);
    ranges.range30_70[1].push(valuesForYear.length > 0 ? quantile(valuesForYear, 0.7) || 0 : 0);
    
    ranges.range40_60[0].push(valuesForYear.length > 0 ? quantile(valuesForYear, 0.4) || 0 : 0);
    ranges.range40_60[1].push(valuesForYear.length > 0 ? quantile(valuesForYear, 0.6) || 0 : 0);
  }
  
  return {
    median: medianValues,
    ranges
  };
}