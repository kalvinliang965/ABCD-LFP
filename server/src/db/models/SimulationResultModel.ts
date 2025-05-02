// server/src/db/models/SimulationResult.js
import mongoose, { Schema, Document } from 'mongoose';

// Interface for simulation results stored in the database
export interface ISimulationResult extends Document {
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
    }
  }>;
  
  // Additional fields for frontend requirements
  medianAndAverageValues?: {
    median: {
      investments: { [year: number]: { [investment: string]: number } },
      income: { [year: number]: { [source: string]: number } },
      expenses: { [year: number]: { [type: string]: number } }
    },
    average: {
      investments: { [year: number]: { [investment: string]: number } },
      income: { [year: number]: { [source: string]: number } },
      expenses: { [year: number]: { [type: string]: number } }
    }
  };
  
  // Additional fields for probability of success
  probabilityOfSuccess?: { [year: number]: number };
  
  // Maps for frontend convenience
  investmentTaxStatusMap?: { [investmentName: string]: 'pre-tax' | 'after-tax' | 'non-retirement' };
  
  createdAt: Date;
  updatedAt: Date;
}

// Schema for statistical ranges
const RangesSchema = new Schema({
  range10_90: { type: [Number], required: true},
  range20_80: { type: [Number], required: true},
  range30_70: { type: [Number], required: true },
  range40_60: { type: [Number], required: true }
}, { _id: false });

// // Validation function for array length
// function arrayLength(val) {
//   return val.length === 2;
// }

// Schema for statistical category (investments, income, expenses)
const StatCategorySchema = new Schema({
  median: { type: Number, required: true },
  ranges: { type: RangesSchema, required: true }
}, { _id: false });

// Schema for all statistical data for a year
const YearlyStatsSchema = new Schema({
  totalInvestments: { type: StatCategorySchema },
  totalIncome: { type: StatCategorySchema },
  totalExpenses: { type: StatCategorySchema },
  earlyWithdrawalTax: { type: StatCategorySchema },
  discretionaryExpensesPct: { type: StatCategorySchema }
}, { _id: false });

// Schema for expense breakdown
const ExpenseBreakdownSchema = new Schema({
  expenses: { type: Map, of: Number, required: true },
  taxes: { type: Number, required: true }
}, { _id: false });

// Schema for yearly data
const YearlyDataSchema = new Schema({
  year: { type: Number, required: true },
  
  // Investment data
  total_after_tax: { type: Number, required: true },
  total_pre_tax: { type: Number, required: true },
  total_non_retirement: { type: Number, required: true },
  is_goal_met: { type: Boolean, required: true },
  cash_value: { type: Number, required: true },
  investments: { type: Map, of: Number, required: true },
  
  // Income data
  cur_year_income: { type: Number, required: true },
  cur_year_social_security: { type: Number, required: true },
  cur_year_capital_gains: { type: Number, required: true },
  cur_year_after_tax_contributions: { type: Number, required: true },
  cur_year_early_withdrawals: { type: Number, required: true },
  income_breakdown: { type: Map, of: Number, required: true },
  
  // Expense data
  mandatory_expenses: { type: Number, required: true },
  discretionary_expenses: { type: Number, required: true },
  total_expenses: { type: Number, required: true },
  expense_breakdown: { type: ExpenseBreakdownSchema, required: true },
  
  // Statistical data (optional)
  stats: { type: YearlyStatsSchema },
  
  // Add the new fields for median and average values
  medianValues: {
    type: {
      investments: { type: Map, of: Number },
      income: { type: Map, of: Number },
      expenses: { type: Map, of: Number }
    },
    required: false
  },
  averageValues: {
    type: {
      investments: { type: Map, of: Number },
      income: { type: Map, of: Number },
      expenses: { type: Map, of: Number }
    },
    required: false
  }
}, { _id: false });

// Main schema for simulation results
const SimulationResultSchema: Schema = new Schema({
  scenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
  successProbability: { type: Number, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
  yearlyData: { type: [YearlyDataSchema], required: true },
  
  // Add new fields for frontend requirements
  medianAndAverageValues: {
    type: {
      median: {
        investments: { type: Map, of: Map },
        income: { type: Map, of: Map },
        expenses: { type: Map, of: Map }
      },
      average: {
        investments: { type: Map, of: Map },
        income: { type: Map, of: Map },
        expenses: { type: Map, of: Map }
      }
    },
    required: false
  },
  
  probabilityOfSuccess: { 
    type: Map, 
    of: Number,
    required: false
  },
  
  investmentTaxStatusMap: { 
    type: Map, 
    of: String,
    required: false
  },
  
  // Add the chartData field
  chartData: {
    type: {
      years: [Number],
      medianValues: {
        investments: [Object],
        income: [Object],
        expenses: [Object]
      },
      averageValues: {
        investments: [Object],
        income: [Object],
        expenses: [Object]
      }
    },
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.model<ISimulationResult>('SimulationResult', SimulationResultSchema);