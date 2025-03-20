import mongoose, { Schema, Document } from "mongoose";

// Interface for distribution modes
interface IDistribution {
  mode: "fixed" | "normalDistribution";
  value?: number; // For fixed mode
  mean?: number; // For normalDistribution mode
  stdDev?: number; // For normalDistribution mode
  isPercentage: boolean; // Whether the value is a percentage or absolute amount
}

// Interface for InvestmentType document
export interface IInvestmentType extends Document {
  name: string;
  description?: string;
  expectedAnnualReturn: IDistribution;
  expenseRatio: number;
  expectedAnnualIncome: IDistribution;
  taxability: "tax-exempt" | "taxable";
  createdAt: Date;
  updatedAt: Date;
}

// Distribution Schema
const DistributionSchema = new Schema<IDistribution>(
  {
    mode: {
      type: String,
      enum: ["fixed", "normalDistribution"],
      required: true,
    },
    value: {
      type: Number,
      required: function (this: IDistribution) {
        return this.mode === "fixed";
      },
    },
    mean: {
      type: Number,
      required: function (this: IDistribution) {
        return this.mode === "normalDistribution";
      },
    },
    stdDev: {
      type: Number,
      required: function (this: IDistribution) {
        return this.mode === "normalDistribution";
      },
    },
    isPercentage: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { _id: false }
);

// Investment Type Schema
const InvestmentTypeSchema = new Schema<IInvestmentType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    expectedAnnualReturn: {
      type: DistributionSchema,
      required: true,
    },
    expenseRatio: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedAnnualIncome: {
      type: DistributionSchema,
      required: true,
    },
    taxability: {
      type: String,
      enum: ["tax-exempt", "taxable"],
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create and export the model
const InvestmentType = mongoose.model<IInvestmentType>(
  "InvestmentType",
  InvestmentTypeSchema
);

export default InvestmentType;
