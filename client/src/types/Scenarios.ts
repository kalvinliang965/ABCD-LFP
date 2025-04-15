export type InvestmentTypeRaw = {
  name: string;
  description: string;
  returnAmtOrPct: string; // amount or percent
  returnDistribution: Array<{ [key: string]: any }>; //! chen changed it to match with YAML
  expenseRatio: number;
  incomeAmtOrPct: string;
  incomeDistribution: Array<{ [key: string]: any }>; //! chen changed it to match with YAML
  taxability: boolean;
};

export type EventRaw = {
  name: string;
  start: Array<{ [key: string]: any }>; //! chen changed it to match with YAML
  duration: Array<{ [key: string]: any }>; //! chen changed it to match with YAML
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
  changeDistribution: Array<{ [key: string]: any }>; //! chen changed it to match with YAML
  inflationAdjusted: boolean;
  userFraction: number;
  socialSecurity: boolean;
};

export type ExpenseEventRaw = EventRaw & {
  initialAmount: number;
  changeAmtOrPct: string;
  changeDistribution: Array<{ [key: string]: any }>; //! chen changed it to match with YAML
  inflationAdjusted: boolean;
  userFraction: number;
  discretionary: boolean;
};

export type InvestmentEventRaw = EventRaw & {
  assetAllocation: Array<{ type: string; value: number }>; //! chen changed it to match with YAML
  assetAllocation2: Array<{ type: string; value: number }>; //! chen changed it to match with YAML
  glidePath: boolean;
  maxCash: number;
};

export type RebalanceEventRaw = EventRaw & {
  assetAllocation: Array<{ type: string; value: number }>; //! chen changed it to match with YAML
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
