import { IncomeType, StateType, TaxFilingStatus } from "../../core/Enums";
import { create_scenario_raw_yaml, scenario_yaml_string } from "../ScenarioYamlParser";

describe("parse scenario yaml", () => {
  it("should yaml_string contain scenario data correctly", () => {
    const scenarioRaw = create_scenario_raw_yaml(scenario_yaml_string);
    expect(scenarioRaw).toBeDefined();
    expect(scenarioRaw.name).toBe("Retirement Planning Scenario");
    expect(scenarioRaw.maritalStatus).toBe("couple");
    expect(scenarioRaw.birthYears).toEqual([1985, 1987]);
    
    expect(scenarioRaw.lifeExpectancy.length).toBe(2);
    expect(scenarioRaw.lifeExpectancy[0].type).toBe("fixed");
    expect(scenarioRaw.lifeExpectancy[0].value).toBe(80);
    expect(scenarioRaw.lifeExpectancy[1].type).toBe("normal");
    expect(scenarioRaw.lifeExpectancy[1].mean).toBe(82);
    expect(scenarioRaw.lifeExpectancy[1].stdev).toBe(3);

    expect(scenarioRaw.investments.size).toBe(5);

    expect(scenarioRaw.eventSeries.size).toBe(6);

    const inflation = scenarioRaw.inflationAssumption;
    expect(inflation.type).toBe("fixed");
    expect(inflation.value).toBe(0.03);

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