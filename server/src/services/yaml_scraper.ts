import yaml from "js-yaml";
import { ScenarioRaw } from "../core/domain/raw/scenario_raw";
import { InvestmentRaw } from "../core/domain/raw/investment_raw";
import { InvestmentTypeRaw } from "../core/domain/raw/investment_type_raw";
import { IncomeEventRaw, ExpenseEventRaw, RebalanceEventRaw, InvestmentEventRaw } from "../core/domain/raw/event_raw/event_raw";
import { TaxBracket, TaxBracketSet } from "../core/tax/TaxBrackets";
import { parse_income_type, parse_taxpayer_type } from "../core/Enums";
export const state_tax_yaml_string = `
tax_brackets:
  - min: 0
    max: 8500
    rate: 0.04
    taxpayer_type: "SINGLE"
    income_type: "TAXABLE_INCOME"
      
  - min: 8501
    max: 11700
    rate: 0.045
    taxpayer_type: "SINGLE"
    income_type: "TAXABLE_INCOME"
      
  - min: 11701
    max: 13900
    rate: 0.0525
    taxpayer_type: "SINGLE"
    income_type: "TAXABLE_INCOME"
  
  - min: 13901
    max: 80650
    rate: 0.0585
    taxpayer_type: "SINGLE"
    income_type: "TAXABLE_INCOME"
  
  - min: 80651
    max: 215400
    rate: 0.0625
    taxpayer_type: "SINGLE"
    income_type: "TAXABLE_INCOME"
  
  - min: 215401
    max: 1077550
    rate: 0.0685
    taxpayer_type: "SINGLE"
    income_type: "TAXABLE_INCOME"
  
  - min: 1077551
    max: 5000000
    rate: 0.0965
    taxpayer_type: "SINGLE"
    income_type: "TAXABLE_INCOME"
  
  - min: 5000001
    max: 25000000
    rate: 0.103
    taxpayer_type: "SINGLE"
    income_type: "TAXABLE_INCOME"
  
  - min: 25000001
    max: null  # No upper limit
    rate: 0.109
    taxpayer_type: "SINGLE"
    income_type: "TAXABLE_INCOME"

  - min: 0
    max: 17150
    rate: 0.04
    taxpayer_type: "MARRIED"
    income_type: "TAXABLE_INCOME"
  
  - min: 17151
    max: 23600
    rate: 0.045
    taxpayer_type: "MARRIED"
    income_type: "TAXABLE_INCOME"
  
  - min: 23601
    max: 27900
    rate: 0.0525
    taxpayer_type: "MARRIED"
    income_type: "TAXABLE_INCOME"
  
  - min: 27901
    max: 161550
    rate: 0.0585
    taxpayer_type: "MARRIED"
    income_type: "TAXABLE_INCOME"
  
  - min: 161551
    max: 323200
    rate: 0.0625
    taxpayer_type: "MARRIED"
    income_type: "TAXABLE_INCOME"
  
  - min: 323201
    max: 2155350
    rate: 0.0685
    taxpayer_type: "MARRIED"
    income_type: "TAXABLE_INCOME"
  
  - min: 2155351
    max: 5000000
    rate: 0.0965
    taxpayer_type: "MARRIED"
    income_type: "TAXABLE_INCOME"
  
  - min: 5000001
    max: 25000000
    rate: 0.103
    taxpayer_type: "MARRIED"
    income_type: "TAXABLE_INCOME"
  
  - min: 25000001
    max: null
    rate: 0.109
    taxpayer_type: "MARRIED"
    income_type: "TAXABLE_INCOME"
`

export function create_state_tax_bracketset(yaml_string: string): TaxBracketSet {
  const res: TaxBracketSet = [];
  const parsed_yaml = yaml.load(yaml_string);
  parsed_yaml.tax_brackets.forEach((bracket: any) => {
    res.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      taxpayer_type: parse_taxpayer_type(bracket.taxpayer_type),
      income_type: parse_income_type(bracket.income_type),
    } as TaxBracket)
  })
  return res;
}


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


export function create_scenario_raw_yaml(yamlString: string): ScenarioRaw {
    const parsedData = yaml.load(yamlString);
    return convert_parsed_yaml_to_scenario_raw(parsedData);
}

function convert_parsed_yaml_to_scenario_raw(parsedYaml: any): ScenarioRaw {
    const investmentTypesMap = new Set<InvestmentTypeRaw>();
    parsedYaml.investmentTypes.forEach((type: any) => {
        const investmentType: InvestmentTypeRaw = {
        name: type.name,
        description: type.description,
        returnAmtOrPct: type.returnAmtOrPct,
        returnDistribution: new Map(
            Object.entries(type.returnDistribution)
        ),
        expenseRatio: type.expenseRatio,
        incomeAmtOrPct: type.incomeAmtOrPct,
        incomeDistribution: new Map(
            Object.entries(type.incomeDistribution)
        ),
        taxability: type.taxability,
        };
        investmentTypesMap.add(investmentType);
    });

    const investments = new Set<InvestmentRaw>();
    parsedYaml.investments.forEach((inv: any) => {
        const investment: InvestmentRaw = {
            investmentType: inv.investmentType,
            value: inv.value,
            taxStatus: inv.taxStatus,
            id: inv.id,
        };
        investments.add(investment);
    });

    // 转换事件系列
    const eventSeries = new Set();
    parsedYaml.eventSeries.forEach((event: any) => {
        const startMap = new Map(Object.entries(event.start));
        const durationMap = new Map(Object.entries(event.duration));

        if (event.type === "income") {
        const incomeEvent = {
            name: event.name,
            start: startMap,
            duration: durationMap,
            type: event.type,
            initialAmount: event.initialAmount,
            changeAmtOrPct: event.changeAmtOrPct,
            changeDistribution: new Map(
            Object.entries(event.changeDistribution)
            ),
            inflationAdjusted: event.inflationAdjusted,
            userFraction: event.userFraction,
            socialSecurity: event.socialSecurity,
        };
        eventSeries.add(incomeEvent);
        } else if (event.type === "expense") {
        const expenseEvent = {
            name: event.name,
            start: startMap,
            duration: durationMap,
            type: event.type,
            initialAmount: event.initialAmount,
            changeAmtOrPct: event.changeAmtOrPct,
            changeDistribution: new Map(
            Object.entries(event.changeDistribution)
            ),
            inflationAdjusted: event.inflationAdjusted,
            userFraction: event.userFraction,
            discretionary: event.discretionary,
        };
        eventSeries.add(expenseEvent);
        } else if (event.type === "invest") {
        const investEvent = {
            name: event.name,
            start: startMap,
            duration: durationMap,
            type: event.type,
            assetAllocation: new Map(Object.entries(event.assetAllocation)),
            assetAllocation2: new Map(Object.entries(event.assetAllocation2)),
            glidePath: event.glidePath,
            maxCash: event.maxCash,
        };
        eventSeries.add(investEvent);
        } else if (event.type === "rebalance") {
        const rebalanceEvent = {
            name: event.name,
            start: startMap,
            duration: durationMap,
            type: event.type,
            assetAllocation: new Map(Object.entries(event.assetAllocation)),
        };
        eventSeries.add(rebalanceEvent);
        }
    });

    // 创建ScenarioRaw对象
    return {
        name: parsedYaml.name,
        martialStatus: parsedYaml.maritalStatus, // 注意这里的字段名与YAML中略有不同
        birthYears: parsedYaml.birthYears,
        lifeExpectancy: parsedYaml.lifeExpectancy.map(
        (exp: any) => new Map(Object.entries(exp))
        ),
        investmentTypes: investmentTypesMap,
        investments: investments,
        eventSeries: eventSeries as Set<IncomeEventRaw | IncomeEventRaw | InvestmentEventRaw | RebalanceEventRaw>,
        inflationAssumption: new Map(
        Object.entries(parsedYaml.inflationAssumption)
        ),
        afterTaxContributionLimit: parsedYaml.afterTaxContributionLimit,
        spendingStrategy: parsedYaml.spendingStrategy,
        expenseWithdrawalStrategy: parsedYaml.expenseWithdrawalStrategy,
        RMDStrategy: parsedYaml.RMDStrategy,
        RothConversionOpt: parsedYaml.RothConversionOpt,
        RothConversionStart: parsedYaml.RothConversionStart,
        RothConversionEnd: parsedYaml.RothConversionEnd,
        RothConversionStrategy: parsedYaml.RothConversionStrategy,
        financialGoal: parsedYaml.financialGoal,
        residenceState: parsedYaml.residenceState,
    };
}