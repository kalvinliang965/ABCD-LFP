export type InvestmentTypeRaw = {
  name: string;
  description: string;
  returnAmtOrPct: string; // amount or percent
  returnDistribution: { [key: string]: any };
  expenseRatio: number;
  incomeAmtOrPct: string;
  incomeDistribution: { [key: string]: any };
  taxability: boolean;
};

export type EventRaw = {
  name: string;
  start: { [key: string]: any };
  duration: { [key: string]: any };
  type: string;
};

export type InvestmentRaw = {
  investmentType: string;
  value: number;
  taxStatus: string; // "non-retirement", "pre-tax", "after-tax"
  id: string;
};

export type IncomeEventRaw = EventRaw & {
  initialAmount: number;
  changeAmtOrPct: string;
  changeDistribution: { [key: string]: any };
  inflationAdjusted: boolean;
  userFraction: number;
  socialSecurity: boolean;
};

export type ExpenseEventRaw = EventRaw & {
  initialAmount: number;
  changeAmtOrPct: string;
  changeDistribution: { [key: string]: any };
  inflationAdjusted: boolean;
  userFraction: number;
  discretionary: boolean;
};

export type InvestmentEventRaw = EventRaw & {
  assetAllocation: { [key: string]: number }; //! chen changed it to match with YAML
  assetAllocation2: { [key: string]: number }; //! chen changed it to match with YAML
  glidePath: boolean;
  maxCash: number;
};

export type RebalanceEventRaw = EventRaw & {
  assetAllocation: { [key: string]: number }; //! chen changed it to match with YAML
};

export interface ScenarioRaw {
  name: string;
  maritalStatus: 'couple' | 'individual';
  birthYears: Array<number>;
  lifeExpectancy: Array<{ [key: string]: any }>; //! chen changed it to match with YAML
  investmentTypes: Set<InvestmentTypeRaw>;
  investments: Set<InvestmentRaw>;
  eventSeries: Set<IncomeEventRaw | ExpenseEventRaw | InvestmentEventRaw | RebalanceEventRaw>;
  inflationAssumption: { [key: string]: any }; //! chen changed it to match with YAML
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
