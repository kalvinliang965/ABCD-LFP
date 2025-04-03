import { parse } from "yaml";
import { z } from "zod";
import { ScenarioRaw } from "../core/domain/raw/scenario_raw";
import { InvestmentRaw } from "../core/domain/raw/investment_raw";
import { InvestmentTypeRaw } from "../core/domain/raw/investment_type_raw";
import { IncomeEventRaw, RebalanceEventRaw, InvestmentEventRaw } from "../core/domain/raw/event_raw/event_raw";
import { ReadVResult } from "fs";

export const scenario_yaml_string = `
# file format for scenario import/export.  version: 2025-03-23
# CSE416, Software Engineering, Scott D. Stoller.

# a distribution is represented as a map with one of the following forms:
# {type: fixed, value: <number>}
# {type: normal, mean: <number>, stdev: <number>}
# {type: uniform, lower: <number>, upper: <number>}
# percentages are represented by their decimal value, e.g., 4% is represented as 0.04.

name: "Retirement Planning Scenario"
maritalStatus: couple # couple or individual
birthYears: [1985, 1987] # a list with length 1 or 2, depending on maritalStatus.
lifeExpectancy: [ {type: fixed, value: 80}, {type: normal, mean: 82, stdev: 3} ] # a list with length 1 or 2, depending on maritalStatus.

investmentTypes:
  - name: cash
    description: cash
    returnAmtOrPct: amount # "amount" or "percent"
    returnDistribution: {type: fixed, value: 0}
    expenseRatio: 0
    incomeAmtOrPct: percent
    incomeDistribution: {type: fixed, value: 0}
    taxability: true # Boolean.  true = taxable, false = tax-exempt

  - name: S&P 500
    description: S&P 500 index fund
    returnAmtOrPct: percent  # whether expected annual return is specified as a dollar "amount" or a "percent"
    returnDistribution: {type: normal, mean: 0.06, stdev: 0.02} # distribution of expected annual return
    expenseRatio: 0.001
    incomeAmtOrPct: percent
    incomeDistribution: {type: normal, mean: 0.01, stdev: 0.005}
    taxability: true

  - name: tax-exempt bonds
    description: NY tax-exempt bonds
    returnAmtOrPct: amount # whether expected annual return is specified as a dollar "amount" or a "percent"
    returnDistribution: {type: fixed, value: 0}
    expenseRatio: 0.004
    incomeAmtOrPct: percent
    incomeDistribution: {type: normal, mean: 0.03, stdev: 0.01}
    taxability: false

# investment id is a unique identifier.  without it, we would need to use a pair (investment type, tax status) to identify an investment.
investments:
  - investmentType: cash
    value: 100
    taxStatus: non-retirement # "non-retirement", "pre-tax", or "after-tax"
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
    start: {type: fixed, value: 2025} # a fixed, normal, or uniform distribution (as above)
    duration: {type: fixed, value: 40}
    type: income # "income", "expense", "invest", or "rebalance"
    initialAmount: 75000
    changeAmtOrPct: amount
    changeDistribution: {type: uniform, lower: 500, upper: 2000}
    inflationAdjusted: false # boolean
    userFraction: 1.0 # fraction of the amount associated with the user.  the rest is associated with the spouse.
    socialSecurity: false  # boolean

  - name: food
    start: {type: startWith, eventSeries: salary}  # starts in same year as salary
    duration: {type: fixed, value: 200}  # lasts for the rest of the user's life
    type: expense
    initialAmount: 5000
    changeAmtOrPct: percent
    changeDistribution: {type: normal, mean: 0.02, stdev: 0.01} 
    inflationAdjusted: true
    userFraction: 0.5
    discretionary: false

  - name: vacation
    start: {type: startWith, eventSeries: salary}  # starts in same year as salary
    duration: {type: fixed, value: 40}
    type: expense
    initialAmount: 1200
    changeAmtOrPct: amount
    changeDistribution: {type: fixed, value: 0}
    inflationAdjusted: true
    userFraction: 0.6
    discretionary: true

  - name: streaming services
    start: {type: startWith, eventSeries: salary}  # starts in same year as salary
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
    glidePath: true # boolean
    assetAllocation2: {S&P 500 non-retirement: 0.8, S&P 500 after-tax: 0.2} 
    maxCash: 1000

  - name: rebalance
    start: {type: uniform, lower: 2025, upper: 2030}
    duration: {type: fixed, value: 10}
    type: rebalance
    assetAllocation: {S&P500 non-retirement: 0.7, tax-exempt bonds: 0.3}

inflationAssumption: {type: fixed, value: 0.03}
afterTaxContributionLimit: 7000 # annual limit on contributions to after-tax retirement accounts
spendingStrategy: ["vacation", "streaming services"]  # list of discretionary expenses, identified by name
expenseWithdrawalStrategy: [S&P 500 non-retirement, tax-exempt bonds, S&P 500 after-tax] # list of investments, identified by id
RMDStrategy: [S&P 500 pre-tax] # list of pre-tax investments, identified by id
RothConversionOpt: true   # boolean indicating whether the Roth Conversion optimizer is enabled
RothConversionStart: 2050 # start year
RothConversionEnd: 2060   # end year
RothConversionStrategy: [S&P 500 pre-tax]  # list of pre-tax investments, identified by id
financialGoal: 10000
residenceState: NY  # states are identified by standard 2-letter abbreviations
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
    start: DistributionSchema.pipe(MapSchema),
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
    type: z.literal("investment"),
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

// function convert_parsed_yaml_to_scenario_raw(parsedYaml: any): ScenarioRaw {
//     const investmentTypesMap = new Set<InvestmentTypeRaw>();
//     parsedYaml.investmentTypes.forEach((type: any) => {
//         const investmentType: InvestmentTypeRaw = {
//         name: type.name,
//         description: type.description,
//         returnAmtOrPct: type.returnAmtOrPct,
//         returnDistribution: new Map(
//             Object.entries(type.returnDistribution)
//         ),
//         expenseRatio: type.expenseRatio,
//         incomeAmtOrPct: type.incomeAmtOrPct,
//         incomeDistribution: new Map(
//             Object.entries(type.incomeDistribution)
//         ),
//         taxability: type.taxability,
//         };
//         investmentTypesMap.add(investmentType);
//     });

//     const investments = new Set<InvestmentRaw>();
//     parsedYaml.investments.forEach((inv: any) => {
//         const investment: InvestmentRaw = {
//             investmentType: inv.investmentType,
//             value: inv.value,
//             taxStatus: inv.taxStatus,
//             id: inv.id,
//         };
//         investments.add(investment);
//     });

//     // 转换事件系列
//     const eventSeries = new Set();
//     parsedYaml.eventSeries.forEach((event: any) => {
//         const startMap = new Map(Object.entries(event.start));
//         const durationMap = new Map(Object.entries(event.duration));

//         if (event.type === "income") {
//         const incomeEvent = {
//             name: event.name,
//             start: startMap,
//             duration: durationMap,
//             type: event.type,
//             initialAmount: event.initialAmount,
//             changeAmtOrPct: event.changeAmtOrPct,
//             changeDistribution: new Map(
//             Object.entries(event.changeDistribution)
//             ),
//             inflationAdjusted: event.inflationAdjusted,
//             userFraction: event.userFraction,
//             socialSecurity: event.socialSecurity,
//         };
//         eventSeries.add(incomeEvent);
//         } else if (event.type === "expense") {
//         const expenseEvent = {
//             name: event.name,
//             start: startMap,
//             duration: durationMap,
//             type: event.type,
//             initialAmount: event.initialAmount,
//             changeAmtOrPct: event.changeAmtOrPct,
//             changeDistribution: new Map(
//             Object.entries(event.changeDistribution)
//             ),
//             inflationAdjusted: event.inflationAdjusted,
//             userFraction: event.userFraction,
//             discretionary: event.discretionary,
//         };
//         eventSeries.add(expenseEvent);
//         } else if (event.type === "invest") {
//         const investEvent = {
//             name: event.name,
//             start: startMap,
//             duration: durationMap,
//             type: event.type,
//             assetAllocation: new Map(Object.entries(event.assetAllocation)),
//             assetAllocation2: new Map(Object.entries(event.assetAllocation2)),
//             glidePath: event.glidePath,
//             maxCash: event.maxCash,
//         };
//         eventSeries.add(investEvent);
//         } else if (event.type === "rebalance") {
//         const rebalanceEvent = {
//             name: event.name,
//             start: startMap,
//             duration: durationMap,
//             type: event.type,
//             assetAllocation: new Map(Object.entries(event.assetAllocation)),
//         };
//         eventSeries.add(rebalanceEvent);
//         }
//     });

//     // 创建ScenarioRaw对象
//     return {
//         name: parsedYaml.name,
//         martialStatus: parsedYaml.maritalStatus, // 注意这里的字段名与YAML中略有不同
//         birthYears: parsedYaml.birthYears,
//         lifeExpectancy: parsedYaml.lifeExpectancy.map(
//         (exp: any) => new Map(Object.entries(exp))
//         ),
//         investmentTypes: investmentTypesMap,
//         investments: investments,
//         eventSeries: eventSeries as Set<IncomeEventRaw | IncomeEventRaw | InvestmentEventRaw | RebalanceEventRaw>,
//         inflationAssumption: new Map(
//         Object.entries(parsedYaml.inflationAssumption)
//         ),
//         afterTaxContributionLimit: parsedYaml.afterTaxContributionLimit,
//         spendingStrategy: parsedYaml.spendingStrategy,
//         expenseWithdrawalStrategy: parsedYaml.expenseWithdrawalStrategy,
//         RMDStrategy: parsedYaml.RMDStrategy,
//         RothConversionOpt: parsedYaml.RothConversionOpt,
//         RothConversionStart: parsedYaml.RothConversionStart,
//         RothConversionEnd: parsedYaml.RothConversionEnd,
//         RothConversionStrategy: parsedYaml.RothConversionStrategy,
//         financialGoal: parsedYaml.financialGoal,
//         residenceState: parsedYaml.residenceState,
//     };
// }