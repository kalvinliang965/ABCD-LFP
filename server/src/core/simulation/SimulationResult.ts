import { SimulationYearlyResult, YearResult } from "./SimulationYearlyResult"


export interface SimulationResult {
  scenarioId: string;
  //userId: string; not sure if we need this
  yearlyResults: Array<YearResult>;
  successProbability: number;
  
  // Method to format data for frontend charts
  formatForCharts(): {
    probabilityOfSuccess: { years: number[], probabilities: number[] };
    medianOrAverageValues: { years: number[], data: any };
    probabilityRanges: any;
  };
  
  // Method to format for database storage
  formatForDatabase(): any;
}
//this is the simulation result for the demo from Haifeng
export function create_simulation_result(
  simulation_yearly_result: SimulationYearlyResult,
  scenarioId: string,
  //userId: string; not sure if we need this
): SimulationResult {
  // Extract data from simulation_yearly_result
  const yearlyResults = simulation_yearly_result.yearly_results;
  const successProbability = simulation_yearly_result.success_probability();

  /**
   * Helper function to convert yearly results to chart data format for frontend
   */
  function formatForCharts() {
    // Extract years for all charts
    const years = yearlyResults.map(yr => yr.year);
    
    // 1. Probability of Success data
    const probabilities = yearlyResults.map(yr => yr.is_goal_met ? 100 : 0);
    
    // 2. Create data structure for investments, income, and expenses
    // Helper function to transform Record<string, number> to array format needed by charts
    function convertRecordToDataItems(
      sourceData: YearResult[],
      category: 'investment' | 'income' | 'expense',
      recordSelector: (yr: YearResult) => Record<string, number>
    ) {
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
    
    // Process investments
    const investments = convertRecordToDataItems(
      yearlyResults,
      'investment',
      yr => yr.investments
    );
    
    // Process income
    const income = convertRecordToDataItems(
      yearlyResults,
      'income',
      yr => yr.income_breakdown
    );
    
    // Process expenses
    const expenses = convertRecordToDataItems(
      yearlyResults,
      'expense',
      yr => ({
        ...yr.expense_breakdown.expenses,
        'Taxes': yr.expense_breakdown.taxes
      })
    );
    
    // 3. Create probability range data
    // This is a simplified version - would need actual statistical calculations in production
    const probabilityRanges = {
      totalInvestments: {
        years,
        median: yearlyResults.map(yr => 
          yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement
        ),
        ranges: {
          // These ranges would come from actual simulations in production
          range10_90: [
            yearlyResults.map(yr => (yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement) * 0.8),
            yearlyResults.map(yr => (yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement) * 1.2)
          ],
          range20_80: [
            yearlyResults.map(yr => (yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement) * 0.85),
            yearlyResults.map(yr => (yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement) * 1.15)
          ],
          range30_70: [
            yearlyResults.map(yr => (yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement) * 0.9),
            yearlyResults.map(yr => (yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement) * 1.1)
          ],
          range40_60: [
            yearlyResults.map(yr => (yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement) * 0.95),
            yearlyResults.map(yr => (yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement) * 1.05)
          ]
        }
      },
      totalIncome: {
        years,
        median: yearlyResults.map(yr => yr.cur_year_income),
        ranges: {
          // Simplified ranges
          range10_90: [
            yearlyResults.map(yr => yr.cur_year_income * 0.8),
            yearlyResults.map(yr => yr.cur_year_income * 1.2)
          ],
          range20_80: [
            yearlyResults.map(yr => yr.cur_year_income * 0.85),
            yearlyResults.map(yr => yr.cur_year_income * 1.15)
          ],
          range30_70: [
            yearlyResults.map(yr => yr.cur_year_income * 0.9),
            yearlyResults.map(yr => yr.cur_year_income * 1.1)
          ],
          range40_60: [
            yearlyResults.map(yr => yr.cur_year_income * 0.95),
            yearlyResults.map(yr => yr.cur_year_income * 1.05)
          ]
        }
      },
      totalExpenses: {
        years,
        median: yearlyResults.map(yr => yr.total_expenses),
        ranges: {
          // Simplified ranges
          range10_90: [
            yearlyResults.map(yr => yr.total_expenses * 0.8),
            yearlyResults.map(yr => yr.total_expenses * 1.2)
          ],
          range20_80: [
            yearlyResults.map(yr => yr.total_expenses * 0.85),
            yearlyResults.map(yr => yr.total_expenses * 1.15)
          ],
          range30_70: [
            yearlyResults.map(yr => yr.total_expenses * 0.9),
            yearlyResults.map(yr => yr.total_expenses * 1.1)
          ],
          range40_60: [
            yearlyResults.map(yr => yr.total_expenses * 0.95),
            yearlyResults.map(yr => yr.total_expenses * 1.05)
          ]
        }
      }
    };
    
    return {
      probabilityOfSuccess: { years, probabilities },
      medianOrAverageValues: {
        years,
        data: {
          investments,
          income,
          expenses
        }
      },
      probabilityRanges
    };
  }
  
  /**
   * Helper function to format data for database storage
   */
  function formatForDatabase() {
    return {
      scenarioId,
      //userId,
      yearlyResults,
      successProbability
    };
  }
  
  return {
    scenarioId,
    //userId,
    yearlyResults,
    successProbability,
    formatForCharts,
    formatForDatabase
  };
}