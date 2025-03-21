import mongoose, { Schema, Document } from 'mongoose';

// Distribution types
export interface FixedDistribution {
  type: 'fixed';
  value: number;
}

export interface UniformDistribution {
  type: 'uniform';
  min: number;
  max: number;
}

export interface NormalDistribution {
  type: 'normal';
  mean: number;
  stdDev: number;
}

export interface SeriesReference {
  type: 'startWith' | 'startAfter';
  eventSeries: string;
}

// Start year can be any of these types
export type StartYearConfig = FixedDistribution | UniformDistribution | NormalDistribution | SeriesReference;

// Duration can only be these types
export type DurationConfig = FixedDistribution | UniformDistribution | NormalDistribution;

// Annual change types
export type AmountChangeConfig = FixedDistribution | UniformDistribution | NormalDistribution | {
  type: 'fixedPercent';
  value: number;
};

// Main event series interface
export interface IEventSeries extends Document {
  name: string;
  description?: string;
  type: 'income' | 'expense' | 'invest' | 'rebalance';
  
  // Distribution fields
  startYear: {
    type: 'fixed' | 'uniform' | 'normal' | 'startWith' | 'startAfter';
    value?: number;
    min?: number;
    max?: number;
    mean?: number;
    stdDev?: number;
    eventSeries?: string;
  };
  
  duration: {
    type: 'fixed' | 'uniform' | 'normal';
    value?: number;
    min?: number;
    max?: number;
    mean?: number;
    stdDev?: number;
  };
  
  // Income/Expense fields
  initialAmount?: number;
  annualChange?: {
    type: 'fixed' | 'fixedPercent' | 'uniform' | 'normal';
    value?: number;
    min?: number;
    max?: number;
    mean?: number;
    stdDev?: number;
  };
  inflationAdjust?: boolean;
  userPercentage?: number;
  spousePercentage?: number;
  isSocialSecurity?: boolean;
  isDiscretionary?: boolean;
  
  // Invest/Rebalance fields
  assetAllocation?: {
    type: 'fixed' | 'glidePath';
    investments: {
      investment: string;
      initialPercentage: number;
      finalPercentage?: number;
    }[];
  };
  maxCash?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Separate schema for annual change
const annualChangeSchema = new Schema({
  type: {
    type: String,
    enum: ['fixed', 'fixedPercent', 'uniform', 'normal']
  },
  value: Number,
  min: Number,
  max: Number,
  mean: Number,
  stdDev: Number
}, { _id: false });

// Schema definition
const eventSeriesSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense', 'invest', 'rebalance']
  },
  
  // Distribution fields
  startYear: {
    type: {
      type: String,
      required: true,
      enum: ['fixed', 'uniform', 'normal', 'startWith', 'startAfter']
    },
    value: Number,
    min: Number,
    max: Number,
    mean: Number,
    stdDev: Number,
    eventSeries: {
      type: String,
      ref: 'EventSeries'
    }
  },
  
  duration: {
    type: {
      type: String,
      required: true,
      enum: ['fixed', 'uniform', 'normal']
    },
    value: Number,
    min: Number,
    max: Number,
    mean: Number,
    stdDev: Number
  },
  
  // Income/Expense fields
  initialAmount: {
    type: Number,
    min: 0
  },
  annualChange: annualChangeSchema,
  inflationAdjust: {
    type: Boolean,
    default: false
  },
  userPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  spousePercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  isSocialSecurity: {
    type: Boolean,
    default: false
  },
  isDiscretionary: {
    type: Boolean,
    default: false
  },
  
  // Invest/Rebalance fields
  assetAllocation: {
    type: {
      type: String,
      enum: ['fixed', 'glidePath']
    },
    investments: [{
      investment: {
        type: String,
        required: true
      },
      initialPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      finalPercentage: {
        type: Number,
        min: 0,
        max: 100
      }
    }]
  },
  maxCash: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Simple validation middleware
eventSeriesSchema.pre('save', function(next) {
  // Validate user/spouse percentages sum to 100
  if (this.type === 'income' || this.type === 'expense') {
    if (this.userPercentage != null && this.spousePercentage != null) {
      if (Math.abs(this.userPercentage + this.spousePercentage - 100) > 0.01) {
        return next(new Error('User and spouse percentages must sum to 100'));
      }
    }
  }

  // Validate asset allocation percentages sum to 100
  if ((this.type === 'invest' || this.type === 'rebalance') && this.assetAllocation?.investments) {
    const initialSum = this.assetAllocation.investments
      .reduce((sum, inv) => sum + (inv.initialPercentage || 0), 0);
    
    if (Math.abs(initialSum - 100) > 0.01) {
      return next(new Error('Initial allocation percentages must sum to 100'));
    }

    if (this.assetAllocation.type === 'glidePath') {
      const finalSum = this.assetAllocation.investments
        .reduce((sum, inv) => sum + (inv.finalPercentage || 0), 0);
      
      if (Math.abs(finalSum - 100) > 0.01) {
        return next(new Error('Final allocation percentages must sum to 100'));
      }
    }
  }

  // Validate distribution min/max values
  if (this.startYear?.type === 'uniform' && typeof this.startYear.min === 'number' && typeof this.startYear.max === 'number') {
    if (this.startYear.min >= this.startYear.max) {
      return next(new Error('Start year min must be less than max'));
    }
  }
  
  if (this.duration?.type === 'uniform' && typeof this.duration.min === 'number' && typeof this.duration.max === 'number') {
    if (this.duration.min >= this.duration.max) {
      return next(new Error('Duration min must be less than max'));
    }
  }

  if (this.annualChange?.type === 'uniform' && typeof this.annualChange.min === 'number' && typeof this.annualChange.max === 'number') {
    if (this.annualChange.min >= this.annualChange.max) {
      return next(new Error('Annual change min must be less than max'));
    }
  }

  next();
});

// Add pre-save middleware to validate referenced event series exists
eventSeriesSchema.pre('save', async function(next) {
  if (this.startYear?.type === 'startWith' || this.startYear?.type === 'startAfter') {
    const referencedSeries = await mongoose.model('EventSeries').findOne({ name: this.startYear.eventSeries });
    if (!referencedSeries) {
      return next(new Error(`Referenced event series "${this.startYear.eventSeries}" not found`));
    }
  }
  next();
});

// Create and export the model
export const EventSeries = mongoose.model<IEventSeries>('EventSeries', eventSeriesSchema);