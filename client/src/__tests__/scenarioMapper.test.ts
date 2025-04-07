import { map_form_to_scenario_raw } from "../utils/scenarioMapper";
import { ScenarioRaw, IncomeEventRaw, ExpenseEventRaw, InvestmentEventRaw, RebalanceEventRaw } from "../types/Scenarios";
import { ScenarioType } from "../components/scenarios/ScenarioDetailsForm";
import { ExpectancyType } from "../components/scenarios/LifeExpectancyForm";
import { InflationType, StateOfResidence } from "../components/scenarios/AdditionalSettingsForm";
import { EventSeriesType, StartYearType, DistributionType, AmountChangeType } from "../types/eventSeries";

//mock the investmentTypeStorage
jest.mock("../services/investmentTypeStorage", () => ({
  investmentTypeStorage: {
    get_all: jest.fn().mockReturnValue([
      {
        name: "Stock Fund",
        description: "stock fund",
        returnAmtOrPct: "percent",
        returnDistribution: [{ type: "normal", mean: 8, stdDev: 15 }],
        expenseRatio: 0.1,
        incomeAmtOrPct: "percent",
        incomeDistribution: [{ type: "fixed", value: 2 }],
        taxability: true
      },
      {
        name: "Bond Fund",
        description: "bond fund",
        returnAmtOrPct: "percent",
        returnDistribution: [{ type: "normal", mean: 4, stdDev: 5 }],
        expenseRatio: 0.05,
        incomeAmtOrPct: "percent",
        incomeDistribution: [{ type: "fixed", value: 3 }],
        taxability: true
      }
    ])
  }
}));

describe("scenarioMapper", () => {
  //MOCK DATA
  const mockScenarioDetails = {
    name: "Test Scenario",
    type: "individual" as ScenarioType,
    userBirthYear: 1980
  };

  const mockLifeExpectancyConfig = {
    userExpectancyType: "fixed" as ExpectancyType,
    userFixedAge: 85
  };

  const mockInvestmentsConfig = {
    investments: [
      {
        investmentType: "Stock Fund",
        value: 100000,
        taxStatus: "pre_tax",
        id: "inv-1"
      }
    ]
  };

  const mockAdditionalSettings = {
    inflationConfig: { type: "fixed" as InflationType, value: 2.5 },
    afterTaxContributionLimit: 6000,
    financialGoal: { value: 1000000 },
    stateOfResidence: "NY" as StateOfResidence
  };

  const mockRMDSettings = {
    enableRMD: true,
    startAge: 72,
    accountPriority: ["pre-tax", "after-tax", "non-retirement"],
    availableAccounts: ["pre-tax", "after-tax", "non-retirement"]
  };

  const mockSpendingStrategy = {
    availableExpenses: ["essential", "discretionary"],
    selectedExpenses: ["essential", "discretionary"]
  };

  const mockWithdrawalStrategy = {
    availableAccounts: ["non-retirement", "after-tax", "pre-tax"],
    accountPriority: ["non-retirement", "after-tax", "pre-tax"]
  };

  const mockRothConversionStrategy = {
    roth_conversion_opt: true,
    roth_conversion_start: 65,
    roth_conversion_end: 75,
    availableAccounts: ["pre-tax"],
    accountPriority: ["pre-tax"]
  };

  type AnnualChangeType = "normal" | "fixed" | "uniform" | "fixedPercent";

  type FixedPercentChange = {
    type: "fixedPercent";
    value: number;
  };

  type UniformChange = {
    type: "uniform";
    min: number;
    max: number;
  };

  function createFixedPercentChange(value: number): { type: "fixedPercent"; value: number; } {
    return {
      type: "fixedPercent",
      value
    };
  }

  function createUniformChange(min: number, max: number): { type: "uniform"; min: number; max: number; } {
    return {
      type: "uniform",
      min,
      max
    };
  }

  const salaryChange = createFixedPercentChange(3);

  const rentChange = createUniformChange(100, 300);

  it("correctly maps income events", () => {
    const mockAddedEvents = [
      {
        name: "Salary",
        type: "income" as EventSeriesType,
        startYear: { type: "fixed" as StartYearType, value: 2023 },
        duration: { type: "fixed" as DistributionType, value: 10 },
        initialAmount: 80000,
        changeType: "percent",
        changeDistribution: [{ type: "fixed", value: 3 }],
        inflationAdjusted: true,
        userPercentage: 100,
        isSocialSecurity: false
      }
    ];

    const result = map_form_to_scenario_raw(
      mockScenarioDetails,
      mockLifeExpectancyConfig,
      mockInvestmentsConfig,
      mockAdditionalSettings,
      mockRMDSettings,
      mockSpendingStrategy,
      mockWithdrawalStrategy,
      mockRothConversionStrategy,
      mockAddedEvents
    );

    //check that the result is a valid ScenarioRaw
    expect(result).toBeDefined();
    expect(result.name).toBe("Test Scenario");
    expect(result.martialStatus).toBe("individual");
    expect(result.birthYears).toEqual([1980]);
    expect(result.lifeExpectancy).toEqual([
      { type: "fixed", value: 85 }
    ]);

    //check that the income event was mapped correctly
    const incomeEvents = Array.from(result.eventSeries).filter(
      event => event.type === "income"
    ) as IncomeEventRaw[];
    
    expect(incomeEvents.length).toBe(1);
    expect(incomeEvents[0].name).toBe("Salary");
    expect(incomeEvents[0].initialAmount).toBe(80000);
    expect(incomeEvents[0].changeAmtOrPct).toBe("percent");
    expect(incomeEvents[0].changeDistribution).toEqual([{ type: "fixed", value: 3 }]);
    expect(incomeEvents[0].inflationAdjusted).toBe(true);
    expect(incomeEvents[0].userFraction).toBe(1);
    expect(incomeEvents[0].socialSecurity).toBe(false);
  });

  it("correctly maps expense events", () => {
    const mockAddedEvents = [
      {
        name: "Rent",
        type: "expense" as EventSeriesType,
        startYear: { type: "fixed" as StartYearType, value: 2023 },
        duration: { type: "fixed" as DistributionType, value: 10 },
        initialAmount: 24000,
        changeType: "percent",
        changeDistribution: [{ type: "uniform", min: 100, max: 300 }],
        inflationAdjusted: true,
        userPercentage: 100,
        isDiscretionary: false
      }
    ];

    const result = map_form_to_scenario_raw(
      mockScenarioDetails,
      mockLifeExpectancyConfig,
      mockInvestmentsConfig,
      mockAdditionalSettings,
      mockRMDSettings,
      mockSpendingStrategy,
      mockWithdrawalStrategy,
      mockRothConversionStrategy,
      mockAddedEvents
    );

    //check that the expense event was mapped correctly
    const expenseEvents = Array.from(result.eventSeries).filter(
      event => event.type === "expense"
    ) as ExpenseEventRaw[];
    
    expect(expenseEvents.length).toBe(1);
    expect(expenseEvents[0].name).toBe("Rent");
    expect(expenseEvents[0].initialAmount).toBe(24000);
    expect(expenseEvents[0].changeAmtOrPct).toBe("percent");
    expect(expenseEvents[0].changeDistribution).toEqual([{ type: "uniform", min: 100, max: 300 }]);
    expect(expenseEvents[0].inflationAdjusted).toBe(true);
    expect(expenseEvents[0].userFraction).toBe(1);
    expect(expenseEvents[0].discretionary).toBe(false);
  });

  it("correctly maps investment events", () => {
    const mockAddedEvents = [
      {
        name: "Initial Investment",
        type: "invest" as EventSeriesType,
        startYear: { type: "fixed" as StartYearType, value: 2023 },
        duration: { type: "fixed" as DistributionType, value: 10 },
        initialAmount: 100000,
        inflationAdjusted: false,
        assetAllocation: {
          type: "fixed" as "fixed" | "glidePath",
          investments: [
            { investment: "Stock Fund", initialPercentage: 60 },
            { investment: "Bond Fund", initialPercentage: 40 }
          ]
        },
        glidePath: true,
        maxCash: 10000
      }
    ];

    const result = map_form_to_scenario_raw(
      mockScenarioDetails,
      mockLifeExpectancyConfig,
      mockInvestmentsConfig,
      mockAdditionalSettings,
      mockRMDSettings,
      mockSpendingStrategy,
      mockWithdrawalStrategy,
      mockRothConversionStrategy,
      mockAddedEvents
    );

    //check that the investment event was mapped correctly
    const investmentEvents = Array.from(result.eventSeries).filter(
      event => event.type === "invest"
    ) as InvestmentEventRaw[];
    
    expect(investmentEvents.length).toBe(1);
    expect(investmentEvents[0].name).toBe("Initial Investment");
    expect(investmentEvents[0].assetAllocation).toEqual({
      type: "fixed",
      investments: [
        { investment: "Stock Fund", initialPercentage: 60 },
        { investment: "Bond Fund", initialPercentage: 40 }
      ]
    });
    expect(investmentEvents[0].assetAllocation2).toEqual({
      type: "fixed",
      investments: [
        { investment: "Stock Fund", initialPercentage: 60 },
        { investment: "Bond Fund", initialPercentage: 40 }
      ]
    });
    expect(investmentEvents[0].glidePath).toBe(true);
    expect(investmentEvents[0].maxCash).toBe(10000);
  });

  it("correctly maps rebalance events", () => {
    const mockAddedEvents = [
      {
        name: "Annual Rebalance",
        type: "rebalance" as EventSeriesType,
        startYear: { type: "fixed" as StartYearType, value: 2024 },
        duration: { type: "fixed" as DistributionType, value: 1 },
        initialAmount: 0,
        inflationAdjusted: false,
        assetAllocation: {
          type: "fixed" as "fixed" | "glidePath",
          investments: [
            { investment: "Stock Fund", initialPercentage: 70 },
            { investment: "Bond Fund", initialPercentage: 30 }
          ]
        }
      }
    ];

    const result = map_form_to_scenario_raw(
      mockScenarioDetails,
      mockLifeExpectancyConfig,
      mockInvestmentsConfig,
      mockAdditionalSettings,
      mockRMDSettings,
      mockSpendingStrategy,
      mockWithdrawalStrategy,
      mockRothConversionStrategy,
      mockAddedEvents
    );

    //check that the rebalance event was mapped correctly
    const rebalanceEvents = Array.from(result.eventSeries).filter(
      event => event.type === "rebalance"
    ) as RebalanceEventRaw[];
    
    expect(rebalanceEvents.length).toBe(1);
    expect(rebalanceEvents[0].name).toBe("Annual Rebalance");
    expect(rebalanceEvents[0].assetAllocation).toEqual({
      type: "fixed",
      investments: [
        { investment: "Stock Fund", initialPercentage: 70 },
        { investment: "Bond Fund", initialPercentage: 30 }
      ]
    });
  });

  it("correctly maps couple scenario with distribution-based life expectancy", () => {
    const coupleScenarioDetails = {
      ...mockScenarioDetails,
      type: "couple" as ScenarioType,
      spouseBirthYear: 1982
    };

    const coupleLifeExpectancyConfig = {
      userExpectancyType: "normal" as ExpectancyType,
      userMeanAge: 85,
      userStandardDeviation: 5,
      spouseExpectancyType: "normal" as ExpectancyType,
      spouseMeanAge: 87,
      spouseStandardDeviation: 5
    };

    const result = map_form_to_scenario_raw(
      coupleScenarioDetails,
      coupleLifeExpectancyConfig,
      mockInvestmentsConfig,
      mockAdditionalSettings,
      mockRMDSettings,
      mockSpendingStrategy,
      mockWithdrawalStrategy,
      mockRothConversionStrategy,
      []
    );

    expect(result.martialStatus).toBe("couple");
    expect(result.birthYears).toEqual([1980, 1982]);
    expect(result.lifeExpectancy).toEqual([
      { type: "normal", parameters: { userMeanAge: 85, userStandardDeviation: 5 } },
      { type: "normal", parameters: { userMeanAge: 87, userStandardDeviation: 5 } }
    ]);
  });

  it("correctly maps investments with different tax statuses", () => {
    const investmentsWithDifferentTaxStatuses = {
      investments: [
        {
          investmentType: "Stock Fund",
          value: 100000,
          taxStatus: "pre_tax",
          id: "inv-1"
        },
        {
          investmentType: "Bond Fund",
          value: 50000,
          taxStatus: "after_tax",
          id: "inv-2"
        },
        {
          investmentType: "Stock Fund",
          value: 75000,
          taxStatus: "non_retirement",
          id: "inv-3"
        }
      ]
    };

    const result = map_form_to_scenario_raw(
      mockScenarioDetails,
      mockLifeExpectancyConfig,
      investmentsWithDifferentTaxStatuses,
      mockAdditionalSettings,
      mockRMDSettings,
      mockSpendingStrategy,
      mockWithdrawalStrategy,
      mockRothConversionStrategy,
      []
    );

    const investments = Array.from(result.investments);
    expect(investments.length).toBe(3);
    
    //check that tax statuses are correctly mapped
    expect(investments.find(inv => inv.id === "inv-1")?.taxStatus).toBe("pre-tax");
    expect(investments.find(inv => inv.id === "inv-2")?.taxStatus).toBe("after-tax");
    expect(investments.find(inv => inv.id === "inv-3")?.taxStatus).toBe("non-retirement");
  });

  it("correctly maps Roth conversion strategy", () => {
    const result = map_form_to_scenario_raw(
      mockScenarioDetails,
      mockLifeExpectancyConfig,
      mockInvestmentsConfig,
      mockAdditionalSettings,
      mockRMDSettings,
      mockSpendingStrategy,
      mockWithdrawalStrategy,
      mockRothConversionStrategy,
      []
    );

    expect(result.RothConversionOpt).toBe(true);
    expect(result.RothConversionStart).toBe(65);
    expect(result.RothConversionEnd).toBe(75);
    expect(result.RothConversionStrategy).toEqual(["pre-tax"]);
  });

  it("correctly maps RMD strategy when RMD is disabled", () => {
    const rmdDisabled = {
      enableRMD: false,
      startAge: 72,
      accountPriority: ["pre-tax", "after-tax", "non-retirement"],
      availableAccounts: ["pre-tax", "after-tax", "non-retirement"]
    };

    const result = map_form_to_scenario_raw(
      mockScenarioDetails,
      mockLifeExpectancyConfig,
      mockInvestmentsConfig,
      mockAdditionalSettings,
      rmdDisabled,
      mockSpendingStrategy,
      mockWithdrawalStrategy,
      mockRothConversionStrategy,
      []
    );

    expect(result.RMDStrategy).toEqual([]);
  });

  it("handles missing optional fields gracefully", () => {
    const minimalScenarioDetails = {
      name: "Minimal Scenario",
      type: "individual" as ScenarioType,
      userBirthYear: 1980
    };

    const minimalLifeExpectancyConfig = {
      userExpectancyType: "fixed" as ExpectancyType,
      userFixedAge: 85
    };

    const minimalInvestmentsConfig = {
      investments: []
    };

    const minimalAdditionalSettings = {
      inflationConfig: { type: "fixed" as InflationType, value: 2.5 },
      afterTaxContributionLimit: 6000,
      financialGoal: { value: 0 },
      stateOfResidence: "NY" as StateOfResidence
    };

    const minimalRMDSettings = {
      enableRMD: false,
      startAge: 72,
      accountPriority: [],
      availableAccounts: []
    };

    const minimalSpendingStrategy = {
      availableExpenses: [],
      selectedExpenses: []
    };

    const minimalWithdrawalStrategy = {
      availableAccounts: [],
      accountPriority: []
    };

    const minimalRothConversionStrategy = {
      roth_conversion_opt: false,
      roth_conversion_start: 0,
      roth_conversion_end: 0,
      availableAccounts: [],
      accountPriority: []
    };

    const result = map_form_to_scenario_raw(
      minimalScenarioDetails,
      minimalLifeExpectancyConfig,
      minimalInvestmentsConfig,
      minimalAdditionalSettings,
      minimalRMDSettings,
      minimalSpendingStrategy,
      minimalWithdrawalStrategy,
      minimalRothConversionStrategy,
      []
    );

    expect(result).toBeDefined();
    expect(result.name).toBe("Minimal Scenario");
    expect(result.martialStatus).toBe("individual");
    expect(result.birthYears).toEqual([1980]);
    expect(result.lifeExpectancy).toEqual([
      { type: "fixed", value: 85 }
    ]);
    expect(result.investments.size).toBe(0);
    expect(result.eventSeries.size).toBe(0);
    expect(result.spendingStrategy).toEqual([]);
    expect(result.expenseWithdrawalStrategy).toEqual([]);
    expect(result.RMDStrategy).toEqual([]);
    expect(result.RothConversionOpt).toBe(false);
    expect(result.RothConversionStart).toBe(0);
    expect(result.RothConversionEnd).toBe(0);
    expect(result.RothConversionStrategy).toEqual([]);
    expect(result.financialGoal).toBe(0);
    expect(result.residenceState).toBe("NY");
  });
}); 