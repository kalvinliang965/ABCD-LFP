export enum ScenarioType {
  INDIVIDUAL = "individual",
  COUPLE = "couple",
}

export enum InvestmentTaxStatus {
  NON_RETIREMENT = "non-retirement",
  PRE_TAX_RETIREMENT = "pre-tax-retirement",
  AFTER_TAX_RETIREMENT = "after-tax-retirement",
}

export enum EventSeriesType {
  INCOME = "income",
  EXPENSE = "expense",
  INVEST = "invest",
  REBALANCE = "rebalance",
}

// Basic scenario interface with only the fields we're currently displaying
export interface Scenario {
  id: string;
  name: string;
  type: ScenarioType;
  birthYear: number | string; // Can be a single year or a string like "1982 / 1984" for couples
  lifeExpectancy: number | string; // Can be like "85±5 years" or "90 years"
  financialGoal: string;
  state: string;
  lastModified: string;

  // Optional fields that may be implemented later
  inflationAssumption?: InflationAssumption;
  investmentTypes?: InvestmentType[];
  investments?: Investment[];
  eventSeries?: EventSeries[];
  spendingStrategy?: SpendingStrategy;
  expenseWithdrawalStrategy?: WithdrawalStrategy;
  rmdStrategy?: WithdrawalStrategy;
  rmdStartAge?: number;
  rothConversionStrategy?: WithdrawalStrategy;
  rothConversionSettings?: RothConversionSettings;
  sharingSettings?: SharingSettings;
  initialRetirementContributionLimit?: number;
}

// Supporting interfaces for complete scenario definition
export interface InflationAssumption {
  type: "fixed" | "distribution";
  value: number;
  // Additional fields for distribution type
  distributionType?: "uniform" | "normal";
  min?: number;
  max?: number;
  mean?: number;
  stdDev?: number;
}

export interface InvestmentType {
  name: string;
  description: string;
  returnRate: {
    type: "fixed" | "percentage" | "normal-distribution";
    value: number;
    mean?: number;
    stdDev?: number;
  };
  expenseRatio: number;
  income: {
    type: "fixed" | "percentage" | "normal-distribution";
    value: number;
    mean?: number;
    stdDev?: number;
  };
  taxability: "tax-exempt" | "taxable";
}

export interface Investment {
  investmentType: string;
  value: number;
  taxStatus: InvestmentTaxStatus;
}

export interface EventSeries {
  name: string;
  description?: string;
  type: EventSeriesType;
  startYear: {
    type: "fixed" | "distribution" | "with-series" | "after-series";
    value: number | string;
    referenceSeries?: string;
    distributionType?: "uniform" | "normal";
    min?: number;
    max?: number;
    mean?: number;
    stdDev?: number;
  };
  duration: {
    type: "fixed" | "distribution";
    value: number;
    distributionType?: "uniform" | "normal";
    min?: number;
    max?: number;
    mean?: number;
    stdDev?: number;
  };

  // For income or expense events
  amount?: number;
  amountChange?: {
    type: "fixed" | "percentage" | "distribution";
    value: number;
    distributionType?: "uniform" | "normal";
    min?: number;
    max?: number;
    mean?: number;
    stdDev?: number;
  };
  inflationAdjusted?: boolean;
  userPercentage?: number;
  spousePercentage?: number;
  isSocialSecurity?: boolean;
  isDiscretionary?: boolean;

  // For invest or rebalance events
  assetAllocation?: {
    type: "fixed" | "glide-path";
    initial: { [investmentId: string]: number }; // Percentages
    final?: { [investmentId: string]: number }; // Percentages for glide path
  };
  maximumCash?: number;
}

export interface SpendingStrategy {
  expenseOrder: string[]; // IDs of discretionary expenses in order of priority
}

export interface WithdrawalStrategy {
  investmentOrder: string[]; // IDs of investments in order of withdrawal
}

export interface RothConversionSettings {
  enabled: boolean;
  startYear?: number;
  endYear?: number;
}

export interface SharingSettings {
  isPublic: boolean;
  sharedWith: string[]; // User IDs
}

// These are sample scenarios for the initial display
export const SAMPLE_SCENARIOS: Scenario[] = [
  {
    id: "early-retirement",
    name: "Early Retirement Plan",
    type: ScenarioType.INDIVIDUAL,
    birthYear: 1985,
    lifeExpectancy: "85±5 years",
    financialGoal: "$2.0M",
    state: "California",
    lastModified: "2024/3/14",
  },
  {
    id: "family-planning",
    name: "Family Planning",
    type: ScenarioType.COUPLE,
    birthYear: "1982 / 1984",
    lifeExpectancy: "90 years",
    financialGoal: "$3.0M",
    state: "Texas",
    lastModified: "2024/3/9",
  },
];
