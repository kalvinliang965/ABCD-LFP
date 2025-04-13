import mongoose, { Schema, Document } from 'mongoose';
//the model mimics structure of the yaml file
//every time the user presses continue while moving in between forms
//the current local state will be updated.
// it iwll be updated with the whole local state each time.
//this way if user goes back and forth, the last continue button should overwrite 
// and save the whole updated information

//interfaces for nested objects
interface Distribution {
  type: 'fixed' | 'normal' | 'uniform';
  value?: number;
  mean?: number;
  stdev?: number;
  lower?: number;
  upper?: number;
}

interface StartCondition {
  type: 'fixed' | 'startWith' | 'startAfter';
  value?: number;
  eventSeries?: string;
}

interface InvestmentType {
  name: string;
  description: string;
  returnAmtOrPct: 'amount' | 'percent';
  returnDistribution: Distribution;
  expenseRatio: number;
  incomeAmtOrPct: 'amount' | 'percent';
  incomeDistribution: Distribution;
  taxability: boolean;
}

interface Investment {
  investmentType: string;
  value: number;
  taxStatus: 'non-retirement' | 'pre-tax' | 'after-tax';
  id: string;
}

interface EventSeries {
  name: string;
  start: StartCondition;
  duration: Distribution;
  type: 'income' | 'expense' | 'invest' | 'rebalance';
  initialAmount: number;
  changeAmtOrPct: 'amount' | 'percent';
  changeDistribution: Distribution;
  inflationAdjusted: boolean;
  userFraction: number;
  socialSecurity?: boolean;
  discretionary?: boolean;
  assetAllocation?: Record<string, number>;
  glidePath?: boolean;
  assetAllocation2?: Record<string, number>;
  maxCash?: number;
}

//scenario interface
interface IScenario extends Document {
  userId: mongoose.Types.ObjectId; //user id
  isDraft: boolean; //the boolean to indicate whether the scenario is complete or in progress
  name: string;
  maritalStatus: 'couple' | 'individual';
  birthYears: number[];
  lifeExpectancy: Distribution[];
  investmentTypes: InvestmentType[];
  investments: Investment[];
  eventSeries: EventSeries[];
  inflationAssumption: Distribution;
  afterTaxContributionLimit: number;
  spendingStrategy: string[];
  expenseWithdrawalStrategy: string[];
  RMDStrategy: string[];
  RothConversionOpt: boolean;
  RothConversionStart: number;
  RothConversionEnd: number;
  RothConversionStrategy: string[];
  financialGoal: number;
  residenceState: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScenarioSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDraft: { type: Boolean, default: true },
  name: { type: String, required: true },
  maritalStatus: { type: String, enum: ['couple', 'individual'], required: true },
  birthYears: { type: [Number], required: true },
  lifeExpectancy: { type: [Schema.Types.Mixed], required: true },
  investmentTypes: { type: [Schema.Types.Mixed], required: true },
  investments: { type: [Schema.Types.Mixed], required: true },
  eventSeries: { type: [Schema.Types.Mixed], required: true },
  inflationAssumption: { type: Schema.Types.Mixed, required: true },
  afterTaxContributionLimit: { type: Number, required: true },
  spendingStrategy: { type: [String], required: true },
  expenseWithdrawalStrategy: { type: [String], required: true },
  RMDStrategy: { type: [String], required: true },
  RothConversionOpt: { type: Boolean, required: true },
  RothConversionStart: { type: Number, required: true },
  RothConversionEnd: { type: Number, required: true },
  RothConversionStrategy: { type: [String], required: true },
  financialGoal: { type: Number, required: true },
  residenceState: { type: String, required: true }
}, {
  timestamps: true 
});

export default mongoose.model<IScenario>('Scenario', ScenarioSchema); 