// src/types/investment.ts

export interface Investment {
    _id?: string;  // Mongo ObjectId (optional)
    name: string;
    description?: string;
    icon?: string; //for store the icon URL //todo: add the icon to the database

    // 年化资本增值
    expectedAnnualReturn: {
      mode: 'fixed' | 'normal' | 'gbm';
      value: number;    // if mode=fixed, it means fixed return rate (0.08=8%)
      stdDev?: number;  // if mode=normal/gbm, used for volatility
      drift?: number;   // if need GBM drift rate
    };
  
    // expense ratio
    expenseRatio: number;  // 0.01 => 1%
  
    // dividend yield
    dividendYield: {
      mode: 'fixed' | 'normal' | 'gbm';
      value: number;
      stdDev?: number;
      drift?: number;
    };
  
    // taxability
    isTaxExempt: boolean;  // true => tax-exempt; false => taxable
  
    // last updated time
    lastUpdated?: string | Date; // Date type or ISO string
  }
  