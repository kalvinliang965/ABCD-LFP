import mongoose, { Schema, Document } from "mongoose";
import { Taxability, DistributionType } from "../../core/Enums";

// Interface for distribution modes
interface IDistribution {
  mode: DistributionType.NORMAL | DistributionType.UNIFORM;
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
  taxability: Taxability.TAXABLE | Taxability.TAX_EXEMPT;
  createdAt: Date;
  updatedAt: Date;
}

// Distribution Schema
const DistributionSchema = new Schema<IDistribution>(
  {
    mode: {
      type: String,
      enum: [DistributionType.UNIFORM, DistributionType.NORMAL],
      required: true,
    },
    value: {
      type: Number,
      required: function (this: IDistribution) {
        return this.mode === DistributionType.UNIFORM;
      },
    },
    mean: {
      type: Number,
      required: function (this: IDistribution) {
        return this.mode === DistributionType.NORMAL;
      },
    },
    stdDev: {
      type: Number,
      required: function (this: IDistribution) {
        return this.mode === DistributionType.NORMAL;
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
      enum: [Taxability.TAX_EXEMPT, Taxability.TAXABLE],
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
