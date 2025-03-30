export type InvestmentTypeRaw = {
  name: string;
  description: string;
  returnAmtOrPct: string; // amount or percent
  returnDistribution: Map<string, any>;
  expenseRatio: number;
  incomeAmtOrPct: string;
  incomeDistribution: Map<string, any>;
  taxability: boolean;
};

export type EventRaw = {
  name: string;
  start: Map<string, any>;
  duration: Map<string, any>;
  type: string;
};

export type InvestmentRaw = {
  investmentType: InvestmentTypeRaw;
  value: number;
  taxStatus: string; // "non-retirement", "pre-tax", "after-tax"
  id: string;
};

export type IncomeEventRaw = EventRaw & {
  initialAmount: number;
  changeAmtOrPct: string;
  changeDistribution: Map<string, any>;
  inflationAdjusted: boolean;
  userFraction: number;
  socialSecurity: boolean;
};

export type ExpenseEventRaw = EventRaw & {
  initialAmount: number;
  changeAmtOrPct: string;
  changeDistribution: Map<string, any>;
  inflationAdjusted: boolean;
  userFraction: number;
  discretionary: boolean;
};

export type InvestmentEventRaw = EventRaw & {
  assetAllocation: Map<string, number>;
  assetAllocation2: Map<string, number>;
  glidePath: boolean;
  maxCash: number;
};

export type RebalanceEventRaw = EventRaw & {
  assetAllocation: Map<string, number>;
};

export interface ScenarioRaw {
  name: string;
  martialStatus: string;
  birthYears: Array<number>;
  lifeExpectancy: Array<Map<string, any>>;
  investments: Set<InvestmentRaw>;
  eventSeries: Set<
    IncomeEventRaw | ExpenseEventRaw | InvestmentEventRaw | RebalanceEventRaw
  >;
  inflationAssumption: Map<string, number>;
  afterTaxContributionLimit: number;
  spendingStrategy: Array<string>;
  expenseWithdrawalStrategy: Array<string>;
  RMDStrategy: Array<string>;
  RothConversionOpt: boolean;
  RothConversionStart: number;
  RothConversionEnd: number;
  RothConversionStrategy: Array<string>;
  financialGoal: number;
  residenceState: string;
}