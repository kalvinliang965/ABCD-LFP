// Event Series Types
export type EventSeriesType = 'income' | 'expense' | 'invest' | 'rebalance';

export type DistributionType = 'fixed' | 'uniform' | 'normal';
export type StartYearType = 'fixed' | 'uniform' | 'normal' | 'startWith' | 'startAfter';

export interface DistributionConfig {
  type: DistributionType;
  value?: number;
  min?: number;
  max?: number;
  mean?: number;
  stdev?: number;
}

export interface StartYearConfig {
  type: StartYearType;
  value?: number;
  min?: number;
  max?: number;
  mean?: number;
  stdev?: number;
  eventSeries?: string;
}

export interface AmountChangeType {
  type: 'fixed' | 'fixedPercent' | 'uniform' | 'normal';
  value?: number;
  min?: number;
  max?: number;
  mean?: number;
  stdev?: number;
}

export interface SeriesReference {
  type: 'withSeries' | 'afterSeries';
  seriesName: string;
}

export interface EventSeries {
  id: string;
  type: EventSeriesType;
  name: string;
  description?: string;
  startYear: StartYearConfig;
  duration: DistributionConfig;
  initialAmount: number;
  annualChange?: AmountChangeType;
  inflationAdjusted: boolean;
  userPercentage?: number;
  spousePercentage?: number;
  discretionary?: boolean;
  isSocialSecurity?: boolean;
  maxCash?: number;
  assetAllocation?: {
    type: 'fixed' | 'glidePath';
    investments: {
      investment: string;
      initialPercentage: number;
      finalPercentage?: number;
    }[];
  };
}