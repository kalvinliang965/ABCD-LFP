import mongoose, { Schema, Document } from 'mongoose';

export interface IInvestment extends Document {
  investmentType: string;
  value: number;
  taxStatus: 'non-retirement' | 'pre-tax' | 'after-tax';
  id: string;
}

const investmentSchema = new Schema<IInvestment>({
  investmentType: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  taxStatus: {
    type: String,
    required: true,
    enum: ['non-retirement', 'pre-tax', 'after-tax']
  },
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
});

// Create a compound index on investmentType and taxStatus
investmentSchema.index({ investmentType: 1, taxStatus: 1 });

// Pre-save middleware to generate the id if not provided
investmentSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = `${this.investmentType} ${this.taxStatus}`;
  }
  next();
});

export const Investment = mongoose.model<IInvestment>('Investment', investmentSchema); 