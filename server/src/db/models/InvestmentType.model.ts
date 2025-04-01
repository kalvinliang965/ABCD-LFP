import mongoose, { Schema, Document } from "mongoose";
import { InvestmentTypeRaw } from "../../core/domain/scenario/Scenario";
export interface InvestmentTypeToDB extends Document, InvestmentTypeRaw {
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Investment Type Schema
const InvestmentTypeSchema = new Schema<InvestmentTypeToDB>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    returnAmtOrPct: {
      type: String,
      enum: ["amount", "percentage"],
      required: true,
    },
    returnDistribution: {
      type: Map,
      required: true,
    },
    expenseRatio: {
      type: Number,
      required: true,
    },
    incomeAmtOrPct: {
      type: String,
      enum: ["amount", "percentage"],
      required: true,
    },
    incomeDistribution: {
      type: Map,
      required: true,
    },
    taxability: {
      type: Boolean,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

//保证同一个user的investmentType name是唯一的
InvestmentTypeSchema.index({ userId: 1, name: 1 }, { unique: true });

// Create and export the model
const InvestmentType = mongoose.model<InvestmentTypeToDB>(
  "InvestmentType",
  InvestmentTypeSchema
);

export default InvestmentType;
