// server/src/db/models/SimulationResult.js
import mongoose, { Schema, Document } from 'mongoose';

// Interface for simulation results stored in the database
export interface ISimulationResult extends Document {
  scenarioId: string;
  userId: mongoose.Types.ObjectId;
  successProbability: number;
  years: number[];
  startYear: number;
  endYear: number;
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
  createdAt: Date;
  updatedAt: Date;
}

// Schema for ranges
const RangesSchema = new Schema({
  range10_90: { type: [[Number]], required: true },
  range20_80: { type: [[Number]], required: true },
  range30_70: { type: [[Number]], required: true },
  range40_60: { type: [[Number]], required: true }
}, { _id: false });

// Schema for total values with ranges
const TotalValuesSchema = new Schema({
  median: { type: [Number], required: true },
  ranges: { type: RangesSchema, required: true }
}, { _id: false });

// Schema for investments
const InvestmentSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['investment'], required: true },
  taxStatus: { type: String, enum: ['non-retirement', 'pre-tax', 'after-tax'] },
  values: { type: [Number], required: true }
}, { _id: false });

// Schema for income
const IncomeSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['income'], required: true },
  values: { type: [Number], required: true }
}, { _id: false });

// Schema for expenses
const ExpenseSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['expense'], required: true },
  values: { type: [Number], required: true }
}, { _id: false });

// Main schema for simulation results
const SimulationResultSchema: Schema = new Schema({
  scenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  successProbability: { type: Number, required: true },
  years: { type: [Number], required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
  investments: { type: [InvestmentSchema], required: true },
  income: { type: [IncomeSchema], required: true },
  expenses: { type: [ExpenseSchema], required: true },
  totalInvestments: { type: TotalValuesSchema },
  totalIncome: { type: TotalValuesSchema },
  totalExpenses: { type: TotalValuesSchema }
}, {
  timestamps: true
});

export default mongoose.model<ISimulationResult>('SimulationResult', SimulationResultSchema);