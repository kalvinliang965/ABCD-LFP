import { parse } from "yaml";
import { z } from "zod";
import { ScenarioRaw } from "../core/domain/raw/scenario_raw";
import { InvestmentRaw } from "../core/domain/raw/investment_raw";
import { InvestmentTypeRaw } from "../core/domain/raw/investment_type_raw";
import { IncomeEventRaw, RebalanceEventRaw, InvestmentEventRaw } from "../core/domain/raw/event_raw/event_raw";
import { ReadVResult } from "fs";

export const scenario_yaml_string = `
name: "Retirement Planning Scenario"
maritalStatus: couple # couple or individual
birthYears: [1985, 1987] # a list with length 1 or 2, depending on maritalStatus.
lifeExpectancy: [ {type: fixed, value: 80}, {type: normal, mean: 82, stdev: 3} ]

investmentTypes:
  - name: cash
    description: cash
    returnAmtOrPct: amount
    returnDistribution: {type: fixed, value: 0}
    expenseRatio: 0
    incomeAmtOrPct: percent
    incomeDistribution: {type: fixed, value: 0}
    taxability: true

  - name: S&P 500
    description: S&P 500 index fund
    returnAmtOrPct: percent 
    returnDistribution: {type: normal, mean: 0.06, stdev: 0.02}
    expenseRatio: 0.001
    incomeAmtOrPct: percent
    incomeDistribution: {type: normal, mean: 0.01, stdev: 0.005}
    taxability: true

  - name: tax-exempt bonds
    description: NY tax-exempt bonds
    returnAmtOrPct: amount
    returnDistribution: {type: fixed, value: 0}
    expenseRatio: 0.004
    incomeAmtOrPct: percent
    incomeDistribution: {type: normal, mean: 0.03, stdev: 0.01}
    taxability: false
investments:
  - investmentType: cash
    value: 100
    taxStatus: non-retirement
    id: cash

  - investmentType: S&P 500
    value: 10000
    taxStatus: non-retirement
    id: S&P 500 non-retirement
    
  - investmentType: tax-exempt bonds
    value: 2000
    taxStatus: non-retirement
    id: tax-exempt bonds

  - investmentType: S&P 500
    value: 10000
    taxStatus: pre-tax
    id: S&P 500 pre-tax
    
  - investmentType: S&P 500
    value: 2000
    taxStatus: after-tax
    id: S&P 500 after-tax
 
eventSeries:
  - name: salary
    start: {type: fixed, value: 2025}
    duration: {type: fixed, value: 40}
    type: income
    initialAmount: 75000
    changeAmtOrPct: amount
    changeDistribution: {type: uniform, lower: 500, upper: 2000}
    inflationAdjusted: false
    userFraction: 1.0
    socialSecurity: false

  - name: food
    start: {type: startWith, eventSeries: salary}
    duration: {type: fixed, value: 200}
    type: expense
    initialAmount: 5000
    changeAmtOrPct: percent
    changeDistribution: {type: normal, mean: 0.02, stdev: 0.01} 
    inflationAdjusted: true
    userFraction: 0.5
    discretionary: false

  - name: vacation
    start: {type: startWith, eventSeries: salary}
    duration: {type: fixed, value: 40}
    type: expense
    initialAmount: 1200
    changeAmtOrPct: amount
    changeDistribution: {type: fixed, value: 0}
    inflationAdjusted: true
    userFraction: 0.6
    discretionary: true

  - name: streaming services
    start: {type: startWith, eventSeries: salary}
    duration: {type: fixed, value: 40}
    type: expense
    initialAmount: 500
    changeAmtOrPct: amount
    changeDistribution: {type: fixed, value: 0}
    inflationAdjusted: true
    userFraction: 1.0
    discretionary: true

  - name: my investments
    start: {type: uniform, lower: 2025, upper: 2030}
    duration: {type: fixed, value: 10}
    type: invest
    assetAllocation: {S&P 500 non-retirement: 0.6, S&P 500 after-tax: 0.4}
    glidePath: true
    assetAllocation2: {S&P 500 non-retirement: 0.8, S&P 500 after-tax: 0.2} 
    maxCash: 1000

  - name: rebalance
    start: {type: uniform, lower: 2025, upper: 2030}
    duration: {type: fixed, value: 10}
    type: rebalance
    assetAllocation: {S&P500 non-retirement: 0.7, tax-exempt bonds: 0.3}

inflationAssumption: {type: fixed, value: 0.03}
afterTaxContributionLimit: 7000
spendingStrategy: ["vacation", "streaming services"] 
expenseWithdrawalStrategy: [S&P 500 non-retirement, tax-exempt bonds, S&P 500 after-tax]
RMDStrategy: [S&P 500 pre-tax]
RothConversionOpt: true
RothConversionStart: 2050
RothConversionEnd: 2060
RothConversionStrategy: [S&P 500 pre-tax]
financialGoal: 10000
residenceState: NY
      `;

const DistributionSchema = z.union([
    z.object({ type: z.literal("fixed"), value: z.number() }),
    z.object({ 
        type: z.literal("normal"),
        mean: z.number(),
        stdev: z.number().nonnegative()
    }),
    z.object({
        type: z.literal("uniform"),
        lower: z.number(),
        upper: z.number()
    })
]);

const StartSchema = DistributionSchema.or(
    (z.object({type: z.literal("startWith"), eventSeries: z.string()})).
    or
    (z.object({type: z.literal("startAfter"), eventSeries: z.string()}))
);

const MapSchema = z.record(z.any()).transform(
    obj => new Map(Object.entries(obj))
);

const InvestmentTypeRawSchema = z.object({
    name: z.string(),
    description: z.string(),
    returnAmtOrPct: z.enum(["amount", "percent"]),
    returnDistribution: DistributionSchema.pipe(MapSchema),
    expenseRatio: z.number().nonnegative(),
    incomeAmtOrPct: z.enum(["amount", "percent"]),
    incomeDistribution: DistributionSchema.pipe(MapSchema),
    taxability: z.boolean()
});

const InvestmentRawSchema = z.object({
    investmentType: z.string(),
    value: z.number().nonnegative(),
    taxStatus: z.enum(["non-retirement", "pre-tax", "after-tax"]),
    id: z.string()
});
     
const BaseEventSchema = z.object({
    name: z.string(),
    start: StartSchema.pipe(MapSchema),
    duration: DistributionSchema.pipe(MapSchema),
    type: z.string()
});


const IncomeEventRawSchema = BaseEventSchema.extend({
    type: z.literal("income"),
    initialAmount: z.number().nonnegative(),
    changeAmtOrPct: z.enum(["amount", "percent"]),
    changeDistribution: DistributionSchema.pipe(MapSchema),
    inflationAdjusted: z.boolean(),
    userFraction: z.number().min(0).max(1),
    socialSecurity: z.boolean()
});

const ExpenseEventRawSchema = BaseEventSchema.extend({
    type: z.literal("expense"),
    initialAmount: z.number().nonnegative(),
    changeAmtOrPct: z.enum(["amount", "percent"]),
    changeDistribution: DistributionSchema.pipe(MapSchema),
    inflationAdjusted: z.boolean(),
    userFraction: z.number().min(0).max(1),
    discretionary: z.boolean()
});

const InvestEventRawSchema = BaseEventSchema.extend({
    type: z.literal("invest"),
    assetAllocation: z.record(z.number()).pipe(MapSchema),
    glidePath: z.boolean(),
    assetAllocation2: z.record(z.number()).pipe(MapSchema),
    maxCash: z.number().nonnegative(),
});

const RebalanceEventRawSchema = BaseEventSchema.extend({
    type: z.literal("rebalance"),
    assetAllocation: z.record(z.number()).pipe(MapSchema)
});

const ScenarioRawSchema = z.object({
    name: z.string(),
    maritalStatus: z.enum(["couple", "individual"]),
    birthYears: z.array(z.number().int()).superRefine((val, ctx) => {
      if (val.length < 1 || val.length > 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Birth years must contain 1 or 2 elements"
        });
      }
    }),
    lifeExpectancy: z.array(DistributionSchema.pipe(MapSchema)),
    investmentTypes: z.array(InvestmentTypeRawSchema).transform(arr => new Set(arr)),
    investments: z.array(InvestmentRawSchema).transform(arr => new Set(arr)),
    eventSeries: z.array(
      z.union([
        IncomeEventRawSchema,
        ExpenseEventRawSchema,
        RebalanceEventRawSchema,
        InvestEventRawSchema,
      ])
    ).transform(arr => new Set(arr)),
    inflationAssumption: DistributionSchema.pipe(MapSchema),
    afterTaxContributionLimit: z.number().nonnegative(),
    spendingStrategy: z.array(z.string()),
    expenseWithdrawalStrategy: z.array(z.string()),
    RMDStrategy: z.array(z.string()),
    RothConversionOpt: z.boolean(),
    RothConversionStart: z.number().int(),
    RothConversionEnd: z.number().int(),
    RothConversionStrategy: z.array(z.string()),
    financialGoal: z.number().nonnegative(),
    residenceState: z.string().length(2)
  }).superRefine((val, ctx) => {
    // check on edge cases
    if (val.maritalStatus === "couple" && val.birthYears.length !== 2) {
      ctx.addIssue({
        path: ["birthYears"],
        code: z.ZodIssueCode.custom,
        message: "Couple must have exactly 2 birth years"
      });
    }
    if (val.maritalStatus === "individual" && val.birthYears.length !== 1) {
      ctx.addIssue({
        path: ["birthYears"],
        code: z.ZodIssueCode.custom,
        message: "Individual must have exactly 1 birth year"
      });
    }
});


export function create_scenario_raw_yaml(yamlString: string): ScenarioRaw {
    const parsed_data = parse(yamlString);
    const result = ScenarioRawSchema.parse(parsed_data);
    return {
        ...result,
        martialStatus: result.maritalStatus,
    }  as unknown as ScenarioRaw;
}