import { create_scenario_raw, scenario_one } from "../raw/scenario_raw";
import {
  cash_investment_one,
  s_and_p_500_investment_non_retirement_one,
  tax_exempt_bonds_investment_one,
  s_and_p_500_investment_pre_tax_one,
  s_and_p_500_investment_after_tax_one,
  create_investment_raw,
  InvestmentRaw,
} from "../raw/investment_raw";
import {
  streaming_services_expense_one,
  food_expense_one,
  vacation_expense_one,
  create_expense_event_raw,
} from "../raw/event_raw/expense_event_raw";
import { create_invest_event_raw, my_investments_investment_one } from "../raw/event_raw/investment_event_raw";
import { rebalance_one } from "../raw/event_raw/rebalance_event_raw";
import { create_income_event_raw, salary_income_event_one } from "../raw/event_raw/income_event_raw";
import { cash_investment_type_one, create_investment_type_raw } from "../raw/investment_type_raw";
import { scenario_yaml_string, create_scenario_raw_yaml } from "../../../services/ScenarioYamlParser";
import { Distribution } from "../raw/common";
import { create_scenario } from "../Scenario";
import { array } from "zod";
import create_invest_event from "../event/InvestEvent";
import create_rebalance_event from "../event/RebalanceEvent";

describe("Scenario initialization test", () => {
  describe("create_scenario_raw function test", () => {

    describe("scenario investment validation", () => {
      const baseInvestment = (overrides: Partial<InvestmentRaw>): InvestmentRaw => ({
        investmentType: "S&P 500",
        taxStatus: "non-retirement",
        value: 1000,
        id: "default-id",
        ...overrides
      });

      describe("cash investment requirements", () => {
        test("should require exactly one non-retirement cash investment", () => {
          const investments = new Set([
            create_investment_raw("cash", 1000, "non-retirement", "cash-account"),
            create_investment_raw("cash", 500, "non-retirement", "duplicate-cash") // 重复的非退休cash
          ]);

          expect(() => create_scenario({ ...scenario_one, investments }, "test"))
            .toThrow(/duplicate/i);
        });

        test("should reject cash with non-retirement tax status", () => {
          const investments = new Set([
            create_investment_raw("cash", 1000, "pre-tax", "invalid-cash") // 错误税务状态
          ]);

          expect(() => create_scenario({ ...scenario_one, investments }, "test"))
            .toThrow(/cash/i);
        });
      });


      describe("edge case handling", () => {
        test("should validate contribution limits per tax type", () => {
          const investments = new Set([
            create_investment_raw("401k", 7000, "pre-tax", "auto-gen"),
            create_investment_raw("401k", 7000, "after-tax", "auto-gen")
          ]);

          expect(() => create_scenario({ 
            ...scenario_one,
            afterTaxContributionLimit: 6000,
            investments
          }, "test")).toThrow(/duplicate/i);
        });
      });

      describe("discretionary expense handling", () => {
        test("should auto-add unprioritized discretionary expenses", () => {

          const eventSeries = new Set([
            create_expense_event_raw(
              "vacation",
              { 
                  type: "fixed",
                  value: 100,
              },
              {
                  type: "fixed",
                  value: 40,
              },
              500,
              "amount",
              {
                  type: "fixed",
                  value: 0,
              },
              true,
              1.0,
              true,
            ),
            create_expense_event_raw(
              "charity",
              { 
                  type: "fixed",
                  value: 100,
              },
              {
                  type: "fixed",
                  value: 40,
              },
              500,
              "amount",
              {
                  type: "fixed",
                  value: 0,
              },
              true,
              1.0,
              false,
            )
          ]);

          const scenario = create_scenario({
            ...scenario_one,
            eventSeries,
            spendingStrategy: ["charity"] // 只指定必要支出
          }, "test");

          expect(scenario.spending_strategy).toEqual(
            expect.arrayContaining(["charity", "vacation"])
          );
        });

        test("should respect user-defined expense priority", () => {
          const eventSeries = new Set([
            create_expense_event_raw(
              "vacation",
              { 
                  type: "fixed",
                  value: 100,
              },
              {
                  type: "fixed",
                  value: 40,
              },
              500,
              "amount",
              {
                  type: "fixed",
                  value: 0,
              },
              true,
              1.0,
              true,
            ),
            create_expense_event_raw(
              "gadgets",
              { 
                  type: "fixed",
                  value: 100,
              },
              {
                  type: "fixed",
                  value: 40,
              },
              500,
              "amount",
              {
                  type: "fixed",
                  value: 0,
              },
              true,
              1.0,
              true,
            ),
          ]);

          const scenario = create_scenario({
            ...scenario_one,
            eventSeries,
            spendingStrategy: ["gadgets", "vacation"] // user define order
          }, "test");

          expect(scenario.spending_strategy).toEqual(["gadgets", "vacation"]);
        });
      });
    });
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
      expect(scenario_one.spendingStrategy).toEqual([
        "vacation",
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


describe("scenario initialization strategy", () => {

  it("general cases", () => {
    const name = "Test Scenario";
    const martialStatus = "individual";
    const birthYears = [1990];
    const lifeExpectancy: Array<Distribution> = [{
        type: "fixed",
        value: 85,
    }];
    const investmentTypes = new Set([
      // one assumption is that scenario should always contain cash type
      create_investment_type_raw(
          "cash",
          "cash",
          "amount",
          {
              type: "fixed",
              value: 600,
          },
          0.004,
          "amount",
          {
              type: "fixed",
              value: 600,
          },
          true
      ),
      create_investment_type_raw(
          "S&P 500",
          "S&P 500",
          "amount",
          {
              type: "fixed",
              value: 600,
          },
          0.004,
          "amount",
          {
              type: "fixed",
              value: 600,
          },
          true
      ),

    ])
    const investments = new Set([
      // must have cash type and it is non retirement
      // cash with other tax status should throw an error
      create_investment_raw(
          "cash",
          100,
          "non-retirement",
          "cash", // this id doesnt match system assumption and should be update
      ),
      create_investment_raw(
        "S&P 500",
        100,
        "non-retirement",
        "S&P 500 1" // this id should be fix later
      ),
      create_investment_raw(
        "S&P 500",
        100,
        "pre-tax",
        "S&P 500 2" // this id should be fix later
      ),
      create_investment_raw(
        "S&P 500",
        100,
        "after-tax",
        "S&P 500 3" // this id should be fix later
      ),
    ]);
    const eventSeries = new Set([
      create_invest_event_raw(
        "investment1",
        { 
            type: "uniform",
            lower: 2025,
            upper: 2030,
        },
        { 
            type: "fixed",
            value: 10,
        },
        {
            "S&P 500 1": 0.6,
            "S&P 500 2": 0.4,
        },
        true,
        {
            "S&P 500 1": 0.8,
            "S&P 500 2": 0.2,
        },
        1000,
      ),
      create_expense_event_raw(
          "vacation",
          {
              type: "fixed",
              value: 40,
          },
          { 
              type: "fixed",
              value: 40,
          },
          1200,
          "amount",
          {
              type: "fixed",
              value: 0,
          },
          true,
          0.6,
          true, // discretionary
      
      ),
    ]);
    const inflationAssumption: Distribution = { 
      type: "fixed",
      value: 0.02,
    };
    const afterTaxContributionLimit = 5000;
    const spendingStrategy: string[] = [];
    const expenseWithdrawalStrategy = ["cash"];
    const RMDStrategy: string[] = [];
    const RothConversionOpt = false;
    const RothConversionStart = 2030;
    const RothConversionEnd = 2035;
    const RothConversionStrategy: string[] = [];
    const financialGoal = 500000;
    const residenceState = "NY"; // must be NY, CT, or NJ

    const scenario_raw = create_scenario_raw(
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

    const scenario = create_scenario(scenario_raw, "random");

    // update the id. cash -> cash non-retirement
    // system shouldnt modify user input order
    expect(scenario.expense_withdrawal_strategy[0]).toBe("cash non-retirement");
    // scenario should append any non included investment

    // expense withdrawal strategy should include all investment
    expect(scenario.expense_withdrawal_strategy).toEqual(
      expect.arrayContaining([
        "cash non-retirement", "S&P 500 after-tax", "S&P 500 pre-tax", "S&P 500 pre-tax"
      ])
    );

    // rmd and roth should contain all pre tax
    expect(scenario.rmd_strategy).toEqual(
      expect.arrayContaining([
        "S&P 500 pre-tax"
      ])
    );

    expect(scenario.roth_conversion_strategy).toEqual(
      expect.arrayContaining([
        "S&P 500 pre-tax"
      ])
    );

    expect(scenario.spending_strategy).toEqual(
      expect.arrayContaining(["vacation"]) // scenario should append any discretionary that is not included
    );

    expect(scenario.event_manager.invest_event.get("investment1")!.asset_allocation.has("S&P 500 pre-tax"));
    expect(scenario.event_manager.invest_event.get("investment1")!.asset_allocation.has("S&P 500 non-retirement"));
  })

  it("should add investment to spending strategy", () => {
    // predefined scenario
    const scenario = create_scenario(scenario_one, "random");

    // here are the order user specified
    expect(scenario.expense_withdrawal_strategy[0]).toBe("S&P 500 non-retirement");
    expect(scenario.expense_withdrawal_strategy[1]).toBe("tax-exempt bonds non-retirement");
    expect(scenario.expense_withdrawal_strategy[2]).toBe("S&P 500 after-tax");

    // we appended additional ones
    expect(scenario.expense_withdrawal_strategy).toEqual(
      expect.arrayContaining([
        "S&P 500 non-retirement", "S&P 500 pre-tax", "cash non-retirement",
        "tax-exempt bonds non-retirement","S&P 500 after-tax"
      ])
    );
    
    expect(scenario.spending_strategy).toEqual([
      "vacation",
      "streaming services"
    ]);

    expect(scenario.rmd_strategy).toEqual([
      "S&P 500 pre-tax"
    ]);

    expect(scenario.roth_conversion_strategy).toEqual([
      "S&P 500 pre-tax"
    ]);

  });


})