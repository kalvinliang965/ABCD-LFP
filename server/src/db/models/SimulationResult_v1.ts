import mongoose, { Schema, Document } from "mongoose";
import { yearly_result } from "../../core/simulation/SimulationResult_v1";

export interface ISimulationResult_v1 extends Document {
  scenarioId: string;
  seed: string;
  runCount: number;
  yearlyResults: Array<yearly_result>;
  createdAt: Date;
  updatedAt: Date;
}

const SimulationResultSchema_v1: Schema = new Schema(
  {
    scenarioId: { type: String, required: true },
    seed: { type: String, required: true },
    runCount: { type: Number, required: true },
    yearlyResults: { type: Array<yearly_result>, required: true },
  },
  {
    timestamps: true,
  }
);

const SimulationResultModel_v1 = mongoose.model<ISimulationResult_v1>(
  "SimulationResult_v1",
  SimulationResultSchema_v1
);

export default SimulationResultModel_v1;
