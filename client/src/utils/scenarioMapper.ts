// AI-generated code
// Create a mapping function to transform form data to ScenarioRaw

import {
  ScenarioRaw,
  InvestmentTypeRaw,
  InvestmentRaw,
  IncomeEventRaw,
  ExpenseEventRaw,
  InvestmentEventRaw,
  RebalanceEventRaw,
  EventRaw,
} from "../types/Scenarios";
import {
  ScenarioDetails,
  ScenarioType,
} from "../components/scenarios/ScenarioDetailsForm";
import { LifeExpectancyConfig } from "../components/scenarios/LifeExpectancyForm";
import { InvestmentsConfig } from "../components/scenarios/InvestmentsForm";
import {
  AdditionalSettingsConfig,
  InflationConfig,
} from "../components/scenarios/AdditionalSettingsForm";
import { RMDSettings } from "../components/scenarios/RMDSettingsForm";
import { SpendingStrategy } from "../components/scenarios/SpendingStrategyForm";
import { WithdrawalStrategy } from "../components/scenarios/WithdrawalStrategyForm";
import { AddedEvent } from "../components/event_series/EventSeriesSection";
import { investmentTypeStorage } from "../services/investmentTypeStorage";
import { RothConversionStrategy } from "../components/scenarios/RothConversionForm";

export function map_form_to_scenario_raw(
  scenarioDetails: ScenarioDetails,
  lifeExpectancyConfig: LifeExpectancyConfig,
  investmentsConfig: InvestmentsConfig,
  additionalSettings: AdditionalSettingsConfig,
  rmdSettings: RMDSettings,
  spendingStrategy: SpendingStrategy,
  withdrawalStrategy: WithdrawalStrategy,
  rothConversionStrategy: RothConversionStrategy,
  addedEvents: AddedEvent[]
): ScenarioRaw {
  // Get birth years
  const birthYears: number[] = [scenarioDetails.userBirthYear];
  if (scenarioDetails.type === "couple" && scenarioDetails.spouseBirthYear) {
    birthYears.push(scenarioDetails.spouseBirthYear);
  }

  // Map life expectancy
  const lifeExpectancy: Array<{ [key: string]: any }> = [];
  if (lifeExpectancyConfig.userExpectancyType === "fixed") {
    lifeExpectancy.push({
      type: "fixed",
      value: lifeExpectancyConfig.userFixedAge,
    });
  } else {
    lifeExpectancy.push({
      type: "normal",
      mean: lifeExpectancyConfig.userMeanAge,
      stdev: lifeExpectancyConfig.userStandardDeviation,
    });
  }

  if (
    scenarioDetails.type === "couple" &&
    lifeExpectancyConfig.spouseExpectancyType
  ) {
    if (lifeExpectancyConfig.spouseExpectancyType === "fixed") {
      lifeExpectancy.push({
        type: "fixed",
        value: lifeExpectancyConfig.spouseFixedAge,
      });
    } else {
      lifeExpectancy.push({
        type: "normal",
        mean: lifeExpectancyConfig.spouseMeanAge,
        stdev: lifeExpectancyConfig.spouseStandardDeviation,
      });
    }
  }

  const inflation_assumption = (() => {
    if (additionalSettings.inflationConfig.type === "fixed") {
      return {
        type: "fixed",
        value: additionalSettings.inflationConfig.value,
      };
    } else if (additionalSettings.inflationConfig.type === "uniform") {
      return {
        type: "uniform",
        lower: additionalSettings.inflationConfig.min,
        upper: additionalSettings.inflationConfig.max,
      };
    } else {
      return {
        type: "normal",
        mean: additionalSettings.inflationConfig.mean,
        stdev: additionalSettings.inflationConfig.standardDeviation,
      };
    }
  })();

  console.log("you are now at the inflation assumption section");
  console.log("Inflation assumption:", inflation_assumption);

  // Map investment types
  const allInvestmentTypes = investmentTypeStorage.get_all();
  console.log("All investment types before mapping:", allInvestmentTypes);

  const investmentTypes = new Set<InvestmentTypeRaw>(
    allInvestmentTypes.map((it: any) => {
      const mappedType = {
        name: it.name,
        description: it.description,
        returnAmtOrPct: it.returnAmtOrPct,
        returnDistribution: it.returnDistribution,
        expenseRatio: it.expenseRatio,
        incomeAmtOrPct: it.incomeAmtOrPct,
        incomeDistribution: it.incomeDistribution,
        taxability: it.taxability,
      };
      console.log(`Mapping investment type ${it.name}:`, {
        original: it,
        mapped: mappedType,
      });
      return mappedType;
    })
  );

  // Map investments
  const investments = new Set<InvestmentRaw>(
    investmentsConfig.investments.map((inv) => ({
      investmentType: inv.investmentType || "",
      value: inv.value || 0,
      taxStatus:
        inv.taxStatus.toLowerCase().replace(/_/g, "-") || "non-retirement",
      id: inv.id,
    }))
  );

  // Map events
  const eventSeries = new Set(
    addedEvents.map((event: any) => {
      //convert startYear and duration objects to arrays as expected by ScenarioRaw
      const startArray = event.startYear ? [event.startYear] : [];
      const durationArray = event.duration ? [event.duration] : [];
      
      const baseEvent = {
        name: event.name,
        start: startArray,
        duration: durationArray,
        type: event.type || "",
      };

      if (event.type === "income") {
        return {
          ...baseEvent,
          initialAmount: event.initialAmount || 0,
          changeAmtOrPct: event.changeType || "percent",
          changeDistribution: event.changeDistribution || [],
          inflationAdjusted: event.inflationAdjusted || false,
          userFraction: (event.userPercentage ?? 100) / 100,
          socialSecurity: event.isSocialSecurity || false,
        } as IncomeEventRaw;
      } else if (event.type === "expense") {
        return {
          ...baseEvent,
          initialAmount: event.initialAmount || 0,
          changeAmtOrPct: event.changeType || "percent",
          changeDistribution: event.changeDistribution || [],
          inflationAdjusted: event.inflationAdjusted || false,
          userFraction: (event.userPercentage ?? 100) / 100,
          discretionary: event.discretionary || false,
        } as ExpenseEventRaw;
      } else if (event.type === "invest") {
        return {
          ...baseEvent,
          assetAllocation: event.assetAllocation || [],
          assetAllocation2:
            event.assetAllocation2 || event.assetAllocation || [], // Use assetAllocation2 if provided, otherwise fallback to assetAllocation
          glidePath: event.glidePath || false,
          maxCash: event.maxCash || 0,
        } as InvestmentEventRaw;
      } else if (event.type === "rebalance") {
        return {
          ...baseEvent,
          assetAllocation: event.assetAllocation || [],
        } as RebalanceEventRaw;
      }
      return baseEvent as EventRaw;
    })
  ) as unknown as Set<
    IncomeEventRaw | ExpenseEventRaw | InvestmentEventRaw | RebalanceEventRaw
  >;

  // Return the final ScenarioRaw object
  return {
    name: scenarioDetails.name,
    maritalStatus: scenarioDetails.type === "couple" ? "couple" : "individual",
    birthYears,
    lifeExpectancy,
    investmentTypes,
    investments,
    eventSeries,
    inflationAssumption: inflation_assumption,
    afterTaxContributionLimit: additionalSettings.afterTaxContributionLimit,
    spendingStrategy: spendingStrategy.selectedExpenses || [],
    expenseWithdrawalStrategy: withdrawalStrategy.accountPriority || [],
    RMDStrategy: rmdSettings.accountPriority || [],
    RothConversionOpt: rothConversionStrategy.roth_conversion_opt,
    RothConversionStart: rothConversionStrategy.roth_conversion_start,
    RothConversionEnd: rothConversionStrategy.roth_conversion_end,
    RothConversionStrategy: rothConversionStrategy.accountPriority,
    financialGoal: additionalSettings.financialGoal?.value || 0,
    residenceState: additionalSettings.stateOfResidence || "NY",
  };
}
