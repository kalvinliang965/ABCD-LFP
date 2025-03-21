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
  stdDev?: number;
}

export interface StartYearConfig {
  type: StartYearType;
  value?: number;
  min?: number;
  max?: number;
  mean?: number;
  stdDev?: number;
  eventSeries?: string;
}

export interface AmountChangeType {
  type: 'fixed' | 'fixedPercent' | 'uniform' | 'normal';
  value?: number;
  min?: number;
  max?: number;
  mean?: number;
  stdDev?: number;
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
  inflationAdjust: boolean;
  userPercentage?: number;
  spousePercentage?: number;
  isDiscretionary?: boolean;
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