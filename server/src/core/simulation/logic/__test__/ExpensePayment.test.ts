// tests/scenarioCreation.test.ts
import fs from "fs";
import yaml from "js-yaml";
import { ScenarioRaw } from "../../../domain/raw/scenario_raw";
import {
  create_scenario,
} from "../../../domain/scenario/Scenario";
import {
  IncomeEventRaw,
  ExpenseEventRaw,
  InvestEventRaw,
  RebalanceEventRaw,
} from "../../../domain/raw/event_raw/event_raw";
import { InvestmentRaw } from "../../../domain/raw/investment_raw";
import { InvestmentTypeRaw } from "../../../domain/raw/investment_type_raw";
import { create_simulation_state } from "../../SimulationState";
import { pay_mandatory_expenses } from "../PayMandatoryExpense";
import { pay_discretionary_expenses } from "../PayDiscretionaryExpense";
import { SpendingEvent, update_expense_amount } from "../ExpenseHelper";
import { create_scenario_raw_yaml, scenario_yaml_string } from "../../../../services/ScenarioYamlParser";
import { state_tax_yaml_string } from "../../../../services/StateYamlParser";
import { create_federal_tax_service } from "../../../tax/FederalTaxService";
import { create_state_tax_service_yaml } from "../../../tax/StateTaxService";
import { state } from "@stdlib/random-base-normal";
const scenarioYaml = `
# file format for scenario import/export.  version: 2025-03-23
# CSE416, Software Engineering, Scott D. Stoller.

# a distribution is represented as a map with one of the following forms:
# {type: fixed, value: <number>}
# {type: normal, mean: <number>, stdev: <number>}
# {type: uniform, lower: <number>, upper: <number>}
# percentages are represented by their decimal value, e.g., 4% is represented as 0.04.

name: "chen's Retirement Planning Scenario"
maritalStatus: couple  # "couple" or "individual"
birthYears: [1985, 1987]  # length=2 => 1st user, 2nd spouse
lifeExpectancy:
  - {type: fixed, value: 80}
  - {type: normal, mean: 82, stdev: 3}

investmentTypes:
  - name: cash
    description: "cash"
    returnAmtOrPct: amount
    returnDistribution: {type: fixed, value: 0}
    expenseRatio: 0
    incomeAmtOrPct: percent
    incomeDistribution: {type: fixed, value: 0}
    taxability: true

  - name: S&P 500
    description: "S&P 500 index fund"
    returnAmtOrPct: percent
    returnDistribution: {type: normal, mean: 0.06, stdev: 0.02}
    expenseRatio: 0.001
    incomeAmtOrPct: percent
    incomeDistribution: {type: normal, mean: 0.01, stdev: 0.005}
    taxability: true

  - name: tax-exempt bonds
    description: "NY tax-exempt bonds"
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
    id: "cash"

  - investmentType: S&P 500
    value: 10000
    taxStatus: non-retirement
    id: "S&P 500 non-retirement"

  - investmentType: tax-exempt bonds
    value: 2000
    taxStatus: non-retirement
    id: "tax-exempt bonds"

  - investmentType: S&P 500
    value: 10000
    taxStatus: pre-tax
    id: "S&P 500 pre-tax"

  - investmentType: S&P 500
    value: 2000
    taxStatus: after-tax
    id: "S&P 500 after-tax"

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
    # 改成和 salary 同一年开始，但用固定分布
    start: {type: fixed, value: 2025}
    duration: {type: fixed, value: 200}  # 200年，相当于覆盖余生
    type: expense
    initialAmount: 5000
    changeAmtOrPct: percent
    changeDistribution: {type: normal, mean: 0.02, stdev: 0.01}
    inflationAdjusted: true
    userFraction: 0.5
    discretionary: false

  - name: streaming services
    start: {type: fixed, value: 2025}
    duration: {type: fixed, value: 40}
    type: expense
    initialAmount: 500
    changeAmtOrPct: amount
    changeDistribution: {type: fixed, value: 30}
    inflationAdjusted: true
    userFraction: 1.0
    discretionary: true

  - name: vacation
    start: {type: fixed, value: 2025}
    duration: {type: fixed, value: 40}
    type: expense
    initialAmount: 1200
    changeAmtOrPct: amount
    changeDistribution: {type: fixed, value: 20}
    inflationAdjusted: false
    userFraction: 0.6
    discretionary: true

  - name: my investments
    start: {type: uniform, lower: 2025, upper: 2030}
    duration: {type: fixed, value: 10}
    type: invest
    assetAllocation: {"S&P 500 non-retirement": 0.6, "S&P 500 after-tax": 0.4}
    glidePath: true
    assetAllocation2: {"S&P 500 non-retirement": 0.8, "S&P 500 after-tax": 0.2}
    maxCash: 1000

  - name: rebalance
    start: {type: uniform, lower: 2025, upper: 2030}
    duration: {type: fixed, value: 10}
    type: rebalance
    assetAllocation: {"S&P 500 non-retirement": 0.7, "tax-exempt bonds": 0.3}

inflationAssumption: {type: fixed, value: 0.03}
afterTaxContributionLimit: 7000
spendingStrategy: ["vacation", "streaming services"]
expenseWithdrawalStrategy: ["tax-exempt bonds", "S&P 500 after-tax","S&P 500 non-retirement"]
RMDStrategy: ["S&P 500 pre-tax"]
RothConversionOpt: true
RothConversionStart: 2050
RothConversionEnd: 2060
RothConversionStrategy: ["S&P 500 pre-tax"]
financialGoal: 10000
residenceState: NY

    `;

console.log("scenarioYaml", scenarioYaml);

const parsedYaml = yaml.load(scenarioYaml);

// 3) 转换为 ScenarioRaw（把需要 Map 的字段全部转成 Map）
const scenarioRaw: ScenarioRaw = convert_yaml_to_scenario_raw(parsedYaml);


const mongoose = require("mongoose");
const mongodb_addr = "mongodb://127.0.0.1:27017/test";
let mongodb;

beforeAll(async () => {
  await mongoose.connect(mongodb_addr, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongodb = mongoose.connection;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// describe("Scenario creation test", () => {
//   it("should create a scenario from YAML data and inspect it", () => {
//     // 2) 用 js-yaml 解析成 JS 对象

//     // 4) 调用 create_scenario(...) 进行解析
//     const scenario: Scenario = create_scenario(scenarioRaw);

//     // 5) 断言和/或打印一些结果
//     expect(scenario).toBeDefined();
//     expect(scenario.name).toBe("chen's Retirement Planning Scenario");
//     console.log("inflation_assumption", scenario.inflation_assumption.sample());
//   });
// });

// describe("Testing Simulation State", () => {
//   it("should pay mandatory expense", async () => {
//     const scenario = create_scenario(scenarioRaw);
//     const state = await create_simulation_state(scenario);

//     const result = pay_mandatory_expenses(state);
//     console.log("result", result);
//   });
// });

describe("Testing Simulation State", () => {
  it("should pay discretionary expense", async () => {
    const scenario = await create_scenario(scenarioRaw);
    // initialize scenario object
    const federal_tax_service = await create_federal_tax_service();
    const state_tax_service = await create_state_tax_service_yaml(scenario.residence_state, state_tax_yaml_string);
    console.log("scenario", scenario);
    const state = await create_simulation_state(scenario, federal_tax_service, state_tax_service,);

    //update 所有的expense的amount
    for (const expense of scenario.event_series) {
      if (expense.type === "expense") {
        update_expense_amount(
          expense as SpendingEvent,
          state.get_current_year(),
          state.inflation_factor
        );
      }
    }

    const result = pay_discretionary_expenses(state);
    console.log("result", result);
  });
});

// tests/objectToMap.ts

export function objectToMap(obj: Record<string, any>): Map<string, any> {
  return new Map(Object.entries(obj));
}

export function convert_yaml_to_scenario_raw(parsedYaml: any): ScenarioRaw {

  
  // (1) 处理lifeExpectancy
  const lifeExpectancy = parsedYaml.lifeExpectancy.map((item: any) =>
    objectToMap(item)
  );

  // (2) 处理 inflationAssumption
  const inflationAssumption = objectToMap(parsedYaml.inflationAssumption);

  // (3) 处理 investmentTypes（若你 create_investment(...) 需要用到 distribution 的 Map）
  //     这里演示如何存成一个 Map，key = investmentType.name
  const investmentTypesMap = new Map<string, InvestmentTypeRaw>();
  if (Array.isArray(parsedYaml.investmentTypes)) {
    parsedYaml.investmentTypes.forEach((typeObj: any) => {
      // 对 returnDistribution, incomeDistribution 做 map 转换
      const returnDist = objectToMap(typeObj.returnDistribution);
      const incomeDist = objectToMap(typeObj.incomeDistribution);

      const investmentType: InvestmentTypeRaw = {
        name: typeObj.name,
        description: typeObj.description,
        returnAmtOrPct: typeObj.returnAmtOrPct,
        returnDistribution: returnDist,
        expenseRatio: typeObj.expenseRatio,
        incomeAmtOrPct: typeObj.incomeAmtOrPct,
        incomeDistribution: incomeDist,
        taxability: typeObj.taxability,
      };
      investmentTypesMap.set(typeObj.name, investmentType);
    });
  }

  // (4) 处理 investments
  const investmentsSet = new Set<InvestmentRaw>();
  if (Array.isArray(parsedYaml.investments)) {
    parsedYaml.investments.forEach((inv: any) => {
      const typeRaw = investmentTypesMap.get(inv.investmentType);
      // 构造 InvestmentRaw
      const invRaw: InvestmentRaw = {
        investmentType: typeRaw.name, // 这里假设一定能找到
        value: inv.value,
        taxStatus: inv.taxStatus,
        id: inv.id,
      };
      investmentsSet.add(invRaw);
    });
  }

  // (5) 处理 eventSeries
  const eventSeriesSet = new Set<
    IncomeEventRaw | ExpenseEventRaw | InvestEventRaw | RebalanceEventRaw
  >();
  if (Array.isArray(parsedYaml.eventSeries)) {
    parsedYaml.eventSeries.forEach((eventObj: any) => {
      const startMap = objectToMap(eventObj.start);
      const durationMap = objectToMap(eventObj.duration);
      let changeDistMap: Map<string, any> | undefined;
      if (eventObj.changeDistribution) {
        changeDistMap = objectToMap(eventObj.changeDistribution);
      }

      // 根据 eventObj.type 构造不同原始事件
      if (eventObj.type === "income") {
        const incomeRaw: IncomeEventRaw = {
          name: eventObj.name,
          start: startMap,
          duration: durationMap,
          type: eventObj.type,
          initialAmount: eventObj.initialAmount,
          changeAmtOrPct: eventObj.changeAmtOrPct,
          changeDistribution: changeDistMap!,
          inflationAdjusted: eventObj.inflationAdjusted,
          userFraction: eventObj.userFraction,
          socialSecurity: eventObj.socialSecurity,
        };
        eventSeriesSet.add(incomeRaw);
      } else if (eventObj.type === "expense") {
        const expenseRaw: ExpenseEventRaw = {
          name: eventObj.name,
          start: startMap,
          duration: durationMap,
          type: eventObj.type,
          initialAmount: eventObj.initialAmount,
          changeAmtOrPct: eventObj.changeAmtOrPct,
          changeDistribution: changeDistMap!,
          inflationAdjusted: eventObj.inflationAdjusted,
          userFraction: eventObj.userFraction,
          discretionary: eventObj.discretionary,
        };
        eventSeriesSet.add(expenseRaw);
      } else if (eventObj.type === "invest") {
        // handle assetAllocation, assetAllocation2
        const allocationMap = objectToMap(eventObj.assetAllocation);
        let allocation2Map: Map<string, number> | undefined;
        if (eventObj.assetAllocation2) {
          allocation2Map = objectToMap(eventObj.assetAllocation2);
        }
        const investRaw: InvestEventRaw = {
          name: eventObj.name,
          start: startMap,
          duration: durationMap,
          type: eventObj.type,
          assetAllocation: allocationMap,
          assetAllocation2: allocation2Map!,
          glidePath: eventObj.glidePath,
          maxCash: eventObj.maxCash,
        };
        eventSeriesSet.add(investRaw);
      } else if (eventObj.type === "rebalance") {
        const rebalanceMap = objectToMap(eventObj.assetAllocation);
        const rebalanceRaw: RebalanceEventRaw = {
          name: eventObj.name,
          start: startMap,
          duration: durationMap,
          type: eventObj.type,
          assetAllocation: rebalanceMap,
        };
        eventSeriesSet.add(rebalanceRaw);
      }
    });
  }

  // (6) 构造一个 ScenarioRaw
  const scenarioRaw: ScenarioRaw = {
    name: parsedYaml.name,
    martialStatus: parsedYaml.maritalStatus,
    birthYears: parsedYaml.birthYears,
    lifeExpectancy: lifeExpectancy,
    investments: investmentsSet,
    eventSeries: eventSeriesSet,
    inflationAssumption,
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

  return scenarioRaw;
}
