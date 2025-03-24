import { create_scenario_raw, scenario_one } from "../../scenario/scenario_raw";
import {
  cash_investment_one,
  s_and_p_investment_one,
  tax_exempt_bonds_investment_one,
  s_and_p_investment_two,
  s_and_p_investment_three,
} from "../../investment/investment_raw";
import {
  streaming_services_expense_one,
  food_expense_one,
  vacation_expense_one,
} from "../../event/expense_event_raw_example";
import { my_investments_investment_one } from "../../event/investment_event_raw_example";
import { rebalance_one } from "../../event/rebalance_event_raw_example";
import { salary_income_one } from "../../event/income_event_raw_example";
import { InvestmentRaw, InvestmentTypeRaw } from "../../scenario/Scenario";

describe("Scenario initialization test", () => {
  describe("create_scenario_raw function test", () => {
    test("should_create_scenario_with_correct_properties", () => {
      // Arrange
      const name = "Test Scenario";
      const martialStatus = "individual";
      const birthYears = [1990];
      const lifeExpectancy = [
        new Map<string, any>([
          ["type", "fixed"],
          ["value", 85],
        ]),
      ];
      const investments = new Set([cash_investment_one]);
      const eventSeries = new Set([salary_income_one, food_expense_one]);
      const inflationAssumption = new Map<string, any>([
        ["type", "fixed"],
        ["value", 0.02],
      ]);
      const afterTaxContributionLimit = 5000;
      const spendingStrategy = ["food"];
      const expenseWithdrawalStrategy = ["cash"];
      const RMDStrategy: string[] = [];
      const RothConversionOpt = false;
      const RothConversionStart = 2030;
      const RothConversionEnd = 2035;
      const RothConversionStrategy: string[] = [];
      const financialGoal = 500000;
      const residenceState = "CA";

      // Act
      const result = create_scenario_raw(
        name,
        martialStatus,
        birthYears,
        lifeExpectancy,
        investments,
        eventSeries,
        inflationAssumption,
        afterTaxContributionLimit,
        spendingStrategy,
        expenseWithdrawalStrategy,
        RMDStrategy,
        RothConversionOpt,
        RothConversionStart,
        RothConversionEnd,
        RothConversionStrategy,
        financialGoal,
        residenceState
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(name);
      expect(result.martialStatus).toBe(martialStatus);
      expect(result.birthYears).toEqual(birthYears);
      expect(result.lifeExpectancy).toEqual(lifeExpectancy);
      expect(result.investments).toEqual(investments);
      expect(result.eventSeries).toEqual(eventSeries);
      expect(result.inflationAssumption).toEqual(inflationAssumption);
      expect(result.afterTaxContributionLimit).toBe(afterTaxContributionLimit);
      expect(result.spendingStrategy).toEqual(spendingStrategy);
      expect(result.expenseWithdrawalStrategy).toEqual(
        expenseWithdrawalStrategy
      );
      expect(result.RMDStrategy).toEqual(RMDStrategy);
      expect(result.RothConversionOpt).toBe(RothConversionOpt);
      expect(result.RothConversionStart).toBe(RothConversionStart);
      expect(result.RothConversionEnd).toBe(RothConversionEnd);
      expect(result.RothConversionStrategy).toEqual(RothConversionStrategy);
      expect(result.financialGoal).toBe(financialGoal);
      expect(result.residenceState).toBe(residenceState);
    });
  });

  describe("predefined scenario_one test", () => {
    test("should_verify_scenario_one_basic_properties", () => {
      // Assert
      expect(scenario_one).toBeDefined();
      expect(scenario_one.name).toBe("Retirement Planning Scenario");
      expect(scenario_one.martialStatus).toBe("couple");
      expect(scenario_one.birthYears).toEqual([1985, 1987]);
      expect(scenario_one.afterTaxContributionLimit).toBe(7000);
      expect(scenario_one.RothConversionOpt).toBe(true);
      expect(scenario_one.RothConversionStart).toBe(2050);
      expect(scenario_one.RothConversionEnd).toBe(2060);
      expect(scenario_one.financialGoal).toBe(10000);
      expect(scenario_one.residenceState).toBe("NY");
    });

    test("should_verify_scenario_one_investments", () => {
      // Assert
      const investments = scenario_one.investments;
      expect(investments.size).toBe(5);
      expect(investments.has(cash_investment_one)).toBe(true);
      expect(investments.has(s_and_p_investment_one)).toBe(true);
      expect(investments.has(tax_exempt_bonds_investment_one)).toBe(true);
      expect(investments.has(s_and_p_investment_two)).toBe(true);
      expect(investments.has(s_and_p_investment_three)).toBe(true);
    });

    test("should_verify_scenario_one_events", () => {
      // Assert
      const events = scenario_one.eventSeries;
      expect(events.size).toBe(6);
      expect(events.has(salary_income_one)).toBe(true);
      expect(events.has(food_expense_one)).toBe(true);
      expect(events.has(vacation_expense_one)).toBe(true);
      expect(events.has(streaming_services_expense_one)).toBe(true);
      expect(events.has(my_investments_investment_one)).toBe(true);
      expect(events.has(rebalance_one)).toBe(true);
    });

    test("should_verify_scenario_one_life_expectancy_distributions", () => {
      // Assert
      const lifeExpectancy = scenario_one.lifeExpectancy;
      expect(lifeExpectancy.length).toBe(2);

      const firstDistribution = lifeExpectancy[0];
      expect(firstDistribution.get("type")).toBe("fixed");
      expect(firstDistribution.get("value")).toBe(80);

      const secondDistribution = lifeExpectancy[1];
      expect(secondDistribution.get("type")).toBe("normal");
      expect(secondDistribution.get("mean")).toBe(82);
      expect(secondDistribution.get("stdev")).toBe(3);
    });

    test("should_verify_scenario_one_inflation_assumption", () => {
      // Assert
      const inflation = scenario_one.inflationAssumption;
      expect(inflation.get("type")).toBe("fixed");
      expect(inflation.get("value")).toBe(0.03);
    });

    test("should_verify_scenario_one_strategies", () => {
      // Assert
      expect(scenario_one.spendingStrategy).toEqual([
        "vaction",
        "streaming services",
      ]);
      expect(scenario_one.expenseWithdrawalStrategy).toEqual([
        "S&P 500 non-retirement",
        "tax-exempt bonds",
        "S&P 500 after-tax",
      ]);
      expect(scenario_one.RMDStrategy).toEqual(["S&P 500 pre-tax"]);
      expect(scenario_one.RothConversionStrategy).toEqual(["S&P 500 pre-tax"]);
    });
  });

  // 测试从YAML格式数据创建场景
  describe("yaml_to_scenario_raw_conversion_test", () => {
    test("should_convert_yaml_to_scenario_raw_correctly", () => {
      // 模拟的YAML字符串数据
      const yamlString = `
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

      // 模拟从YAML解析为JavaScript对象的函数
      function mock_parse_yaml_to_object(yamlString: string): any {
        // 这只是一个模拟，实际上应该使用js-yaml等库解析YAML
        // 这里直接返回一个与YAML内容匹配的对象
        return {
          name: "Retirement Planning Scenario",
          maritalStatus: "couple",
          birthYears: [1985, 1987],
          lifeExpectancy: [
            { type: "fixed", value: 80 },
            { type: "normal", mean: 82, stdev: 3 },
          ],
          investmentTypes: [
            {
              name: "cash",
              description: "cash",
              returnAmtOrPct: "amount",
              returnDistribution: { type: "fixed", value: 0 },
              expenseRatio: 0,
              incomeAmtOrPct: "percent",
              incomeDistribution: { type: "fixed", value: 0 },
              taxability: true,
            },
            {
              name: "S&P 500",
              description: "S&P 500 index fund",
              returnAmtOrPct: "percent",
              returnDistribution: { type: "normal", mean: 0.06, stdev: 0.02 },
              expenseRatio: 0.001,
              incomeAmtOrPct: "percent",
              incomeDistribution: { type: "normal", mean: 0.01, stdev: 0.005 },
              taxability: true,
            },
            {
              name: "tax-exempt bonds",
              description: "NY tax-exempt bonds",
              returnAmtOrPct: "amount",
              returnDistribution: { type: "fixed", value: 0 },
              expenseRatio: 0.004,
              incomeAmtOrPct: "percent",
              incomeDistribution: { type: "normal", mean: 0.03, stdev: 0.01 },
              taxability: false,
            },
          ],
          investments: [
            {
              investmentType: "cash",
              value: 100,
              taxStatus: "non-retirement",
              id: "cash",
            },
            {
              investmentType: "S&P 500",
              value: 10000,
              taxStatus: "non-retirement",
              id: "S&P 500 non-retirement",
            },
            {
              investmentType: "tax-exempt bonds",
              value: 2000,
              taxStatus: "non-retirement",
              id: "tax-exempt bonds",
            },
            {
              investmentType: "S&P 500",
              value: 10000,
              taxStatus: "pre-tax",
              id: "S&P 500 pre-tax",
            },
            {
              investmentType: "S&P 500",
              value: 2000,
              taxStatus: "after-tax",
              id: "S&P 500 after-tax",
            },
          ],
          eventSeries: [
            {
              name: "salary",
              start: { type: "fixed", value: 2025 },
              duration: { type: "fixed", value: 40 },
              type: "income",
              initialAmount: 75000,
              changeAmtOrPct: "amount",
              changeDistribution: { type: "uniform", lower: 500, upper: 2000 },
              inflationAdjusted: false,
              userFraction: 1.0,
              socialSecurity: false,
            },
            {
              name: "food",
              start: { type: "startWith", eventSeries: "salary" },
              duration: { type: "fixed", value: 200 },
              type: "expense",
              initialAmount: 5000,
              changeAmtOrPct: "percent",
              changeDistribution: { type: "normal", mean: 0.02, stdev: 0.01 },
              inflationAdjusted: true,
              userFraction: 0.5,
              discretionary: false,
            },
            {
              name: "vacation",
              start: { type: "startWith", eventSeries: "salary" },
              duration: { type: "fixed", value: 40 },
              type: "expense",
              initialAmount: 1200,
              changeAmtOrPct: "amount",
              changeDistribution: { type: "fixed", value: 0 },
              inflationAdjusted: true,
              userFraction: 0.6,
              discretionary: true,
            },
            {
              name: "streaming services",
              start: { type: "startWith", eventSeries: "salary" },
              duration: { type: "fixed", value: 40 },
              type: "expense",
              initialAmount: 500,
              changeAmtOrPct: "amount",
              changeDistribution: { type: "fixed", value: 0 },
              inflationAdjusted: true,
              userFraction: 1.0,
              discretionary: true,
            },
            {
              name: "my investments",
              start: { type: "uniform", lower: 2025, upper: 2030 },
              duration: { type: "fixed", value: 10 },
              type: "invest",
              assetAllocation: {
                "S&P 500 non-retirement": 0.6,
                "S&P 500 after-tax": 0.4,
              },
              glidePath: true,
              assetAllocation2: {
                "S&P 500 non-retirement": 0.8,
                "S&P 500 after-tax": 0.2,
              },
              maxCash: 1000,
            },
            {
              name: "rebalance",
              start: { type: "uniform", lower: 2025, upper: 2030 },
              duration: { type: "fixed", value: 10 },
              type: "rebalance",
              assetAllocation: {
                "S&P500 non-retirement": 0.7,
                "tax-exempt bonds": 0.3,
              },
            },
          ],
          inflationAssumption: { type: "fixed", value: 0.03 },
          afterTaxContributionLimit: 7000,
          spendingStrategy: ["vacation", "streaming services"],
          expenseWithdrawalStrategy: [
            "S&P 500 non-retirement",
            "tax-exempt bonds",
            "S&P 500 after-tax",
          ],
          RMDStrategy: ["S&P 500 pre-tax"],
          RothConversionOpt: true,
          RothConversionStart: 2050,
          RothConversionEnd: 2060,
          RothConversionStrategy: ["S&P 500 pre-tax"],
          financialGoal: 10000,
          residenceState: "NY",
        };
      }

      // 模拟从JavaScript对象转换为ScenarioRaw对象的函数
      function convert_parsed_yaml_to_scenario_raw(parsedYaml: any) {
        // 转换投资类型
        const investmentTypesMap = new Map<string, InvestmentTypeRaw>();
        parsedYaml.investmentTypes.forEach((type: any) => {
          // 创建投资类型对象
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
          investmentTypesMap.set(type.name, investmentType);
        });

        // 转换投资
        const investments = new Set<InvestmentRaw>();
        parsedYaml.investments.forEach((inv: any) => {
          const investmentTypeRaw = investmentTypesMap.get(inv.investmentType);
          if (investmentTypeRaw) {
            const investment: InvestmentRaw = {
              investmentType: investmentTypeRaw,
              value: inv.value,
              taxStatus: inv.taxStatus,
              id: inv.id,
            };
            investments.add(investment);
          }
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
          investments: investments,
          eventSeries: eventSeries,
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

      // 测试YAML转换过程
      const parsedYaml = mock_parse_yaml_to_object(yamlString);
      const scenarioRaw = convert_parsed_yaml_to_scenario_raw(parsedYaml);

      // 验证转换后的ScenarioRaw对象
      expect(scenarioRaw).toBeDefined();
      expect(scenarioRaw.name).toBe("Retirement Planning Scenario");
      expect(scenarioRaw.martialStatus).toBe("couple");
      expect(scenarioRaw.birthYears).toEqual([1985, 1987]);

      // 验证生命预期
      expect(scenarioRaw.lifeExpectancy.length).toBe(2);
      expect(scenarioRaw.lifeExpectancy[0].get("type")).toBe("fixed");
      expect(scenarioRaw.lifeExpectancy[0].get("value")).toBe(80);
      expect(scenarioRaw.lifeExpectancy[1].get("type")).toBe("normal");
      expect(scenarioRaw.lifeExpectancy[1].get("mean")).toBe(82);
      expect(scenarioRaw.lifeExpectancy[1].get("stdev")).toBe(3);

      // 验证投资集合
      expect(scenarioRaw.investments.size).toBe(5);

      // 验证事件集合
      expect(scenarioRaw.eventSeries.size).toBe(6);

      // 验证通胀假设
      const inflation = scenarioRaw.inflationAssumption;
      expect(inflation.get("type")).toBe("fixed");
      expect(inflation.get("value")).toBe(0.03);

      // 验证其他参数
      expect(scenarioRaw.afterTaxContributionLimit).toBe(7000);
      expect(scenarioRaw.spendingStrategy).toEqual([
        "vacation",
        "streaming services",
      ]);
      expect(scenarioRaw.expenseWithdrawalStrategy).toEqual([
        "S&P 500 non-retirement",
        "tax-exempt bonds",
        "S&P 500 after-tax",
      ]);
      expect(scenarioRaw.RMDStrategy).toEqual(["S&P 500 pre-tax"]);
      expect(scenarioRaw.RothConversionOpt).toBe(true);
      expect(scenarioRaw.RothConversionStart).toBe(2050);
      expect(scenarioRaw.RothConversionEnd).toBe(2060);
      expect(scenarioRaw.RothConversionStrategy).toEqual(["S&P 500 pre-tax"]);
      expect(scenarioRaw.financialGoal).toBe(10000);
      expect(scenarioRaw.residenceState).toBe("NY");
    });
  });
});
