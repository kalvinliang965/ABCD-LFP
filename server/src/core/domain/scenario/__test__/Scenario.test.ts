import { create_scenario_raw, scenario_one } from "../../raw/scenario_raw";
import {
  cash_investment_one,
  s_and_p_500_investment_non_retirement_one,
  tax_exempt_bonds_investment_one,
  s_and_p_500_investment_pre_tax_one,
  s_and_p_500_investment_after_tax_one,
} from "../../raw/investment_raw";
import {
  streaming_services_expense_one,
  food_expense_one,
  vacation_expense_one,
} from "../../raw/event_raw/expense_event_raw";
import { my_investments_investment_one } from "../../raw/event_raw/investment_event_raw";
import { rebalance_one } from "../../raw/event_raw/rebalance_event_raw";
import { salary_income_event_one } from "../../raw/event_raw/income_event_raw";
import { cash_investment_type_one } from "../../raw/investment_type_raw";
import { scenario_yaml_string, create_scenario_raw_yaml } from "../../../../services/ScenarioYamlParser";
import { Distribution } from "../../raw/common";

describe("Scenario initialization test", () => {
  describe("create_scenario_raw function test", () => {
    test("should_create_scenario_with_correct_properties", () => {

      const name = "Test Scenario";
      const martialStatus = "individual";
      const birthYears = [1990];
      const lifeExpectancy: Array<Distribution> = [{
          type: "fixed",
          value: 85,
      }];
      const investmentTypes = new Set([cash_investment_type_one])
      const investments = new Set([cash_investment_one]);
      const eventSeries = new Set([salary_income_event_one, food_expense_one]);
      const inflationAssumption: Distribution = { 
        type: "fixed",
        value: 0.02,
      };
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

      const result = create_scenario_raw(
        name,
        martialStatus,
        birthYears,
        lifeExpectancy,
        investmentTypes,
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
      expect(result.maritalStatus).toBe(martialStatus);
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
      expect(scenario_one.maritalStatus).toBe("couple");
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
      expect(investments.has(s_and_p_500_investment_non_retirement_one)).toBe(true);
      expect(investments.has(tax_exempt_bonds_investment_one)).toBe(true);
      expect(investments.has(s_and_p_500_investment_pre_tax_one)).toBe(true);
      expect(investments.has(s_and_p_500_investment_after_tax_one)).toBe(true);
    });

    test("should_verify_scenario_one_events", () => {
      // Assert
      const events = scenario_one.eventSeries;
      expect(events.size).toBe(6);
      expect(events.has(salary_income_event_one)).toBe(true);
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
      expect(firstDistribution.type).toBe("fixed");
      expect(firstDistribution.value).toBe(80);

      const secondDistribution = lifeExpectancy[1];
      expect(secondDistribution.type).toBe("normal");
      expect(secondDistribution.mean).toBe(82);
      expect(secondDistribution.stdev).toBe(3);
    });

    test("should_verify_scenario_one_inflation_assumption", () => {
      // Assert
      const inflation = scenario_one.inflationAssumption;
      expect(inflation.type).toBe("fixed");
      expect(inflation.value).toBe(0.03);
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
      
      const scenarioRaw = create_scenario_raw_yaml(scenario_yaml_string);


      // 验证转换后的ScenarioRaw对象
      expect(scenarioRaw).toBeDefined();
      expect(scenarioRaw.name).toBe("Retirement Planning Scenario");
      expect(scenarioRaw.maritalStatus).toBe("couple");
      expect(scenarioRaw.birthYears).toEqual([1985, 1987]);

      // 验证生命预期
      expect(scenarioRaw.lifeExpectancy.length).toBe(2);
      expect(scenarioRaw.lifeExpectancy[0].type).toBe("fixed");
      expect(scenarioRaw.lifeExpectancy[0].value).toBe(80);
      expect(scenarioRaw.lifeExpectancy[1].type).toBe("normal");
      expect(scenarioRaw.lifeExpectancy[1].mean).toBe(82);
      expect(scenarioRaw.lifeExpectancy[1].stdev).toBe(3);

      // 验证投资集合
      expect(scenarioRaw.investments.size).toBe(5);

      // 验证事件集合
      expect(scenarioRaw.eventSeries.size).toBe(6);

      // 验证通胀假设
      const inflation = scenarioRaw.inflationAssumption;
      expect(inflation.type).toBe("fixed");
      expect(inflation.value).toBe(0.03);

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
