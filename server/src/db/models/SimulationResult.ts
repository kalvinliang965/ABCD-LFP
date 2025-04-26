// server/src/db/models/SimulationResult.js
import mongoose from 'mongoose';

interface YearResult {
    year: number;
    total_after_tax: number;
    total_pre_tax: number;
    total_non_retirement: number;
    is_goal_met: boolean;
}  

const simulationResultSchema = new mongoose.Schema({
    scenarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    yearlyResults: [{
      year: Number,
      total_after_tax: Number,
      total_pre_tax: Number,
      total_non_retirement: Number,
      is_goal_met: Boolean,
      cash_value: Number,
      investments: Object, // Record<string, number>
      income_breakdown: Object, // Record<string, number>
      expense_breakdown: Object,
    }],
    successProbability: Number,
  });

  const SimulationResult = mongoose.model('SimulationResult', simulationResultSchema);

  export default SimulationResult;