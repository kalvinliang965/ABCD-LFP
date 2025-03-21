// Event Series Types
export type EventSeriesType = 'income' | 'expense' | 'invest' | 'rebalance';

export type DistributionType = 'fixed' | 'uniform' | 'normal';
export type StartYearType = DistributionType | 'withSeries' | 'afterSeries';

export type FixedDistribution = {
  type: 'fixed';
  value: number;
};

export type UniformDistribution = {
  type: 'uniform';
  min: number;
  max: number;
};

export type NormalDistribution = {
  type: 'normal';
  mean: number;
  stdDev: number;
};

export type SeriesReference = {
  type: 'withSeries' | 'afterSeries';
  seriesName: string;
};

export type DistributionConfig = 
  | FixedDistribution 
  | UniformDistribution 
  | NormalDistribution 
  | SeriesReference;

export type StartYearConfig = 
  | FixedDistribution 
  | UniformDistribution 
  | NormalDistribution 
  | SeriesReference;

export type DurationType = 
  | FixedDistribution 
  | UniformDistribution 
  | NormalDistribution;

export type AmountChangeType = 
  | FixedDistribution 
  | { type: 'fixedPercent'; value: number }
  | UniformDistribution 
  | NormalDistribution;

export type AssetAllocation = {
  type: 'fixed' | 'glidePath';
  investments: {
    id: string;
    initialPercentage: number;
    finalPercentage?: number; //only for glidePath
  }[];
};

export interface BaseEventSeries {
  id: string;
  name: string;
  description?: string;
  startYear: StartYearConfig;
  duration: DurationType;
  type: EventSeriesType;
}

export interface IncomeEventSeries extends BaseEventSeries {
  type: 'income';
  initialAmount: number;
  annualChange: AmountChangeType;
  inflationAdjusted: boolean;
  isSocialSecurity: boolean;
  isWages: boolean;
  userPercentage?: number; //for married couples
  spousePercentage?: number; //for married couples
}

export interface ExpenseEventSeries extends BaseEventSeries {
  type: 'expense';
  initialAmount: number;
  annualChange: AmountChangeType;
  inflationAdjusted: boolean;
  isDiscretionary: boolean;
  userPercentage?: number; //for married couples
  spousePercentage?: number; //for married couples
}

export interface InvestEventSeries extends BaseEventSeries {
  type: 'invest';
  assetAllocation: AssetAllocation;
  maxCash: number;
}

export interface RebalanceEventSeries extends BaseEventSeries {
  type: 'rebalance';
  assetAllocation: AssetAllocation;
}

export type EventSeries = 
  | IncomeEventSeries 
  | ExpenseEventSeries 
  | InvestEventSeries 
  | RebalanceEventSeries;