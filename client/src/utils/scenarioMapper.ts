// AI-generated code
// Create a mapping function to transform form data to ScenarioRaw

import { AddedEvent } from '../components/event_series/EventSeriesSection';
import { AdditionalSettingsConfig } from '../components/scenarios/AdditionalSettingsForm';
import { InvestmentsConfig } from '../components/scenarios/InvestmentsForm';
import { LifeExpectancyConfig } from '../components/scenarios/LifeExpectancyForm';
import { RMDSettings } from '../components/scenarios/RMDSettingsForm';
import { RothConversionStrategy } from '../components/scenarios/RothConversionForm';
import { ScenarioDetails } from '../components/scenarios/ScenarioDetailsForm';
import { SpendingStrategy } from '../components/scenarios/SpendingStrategyForm';
import { WithdrawalStrategy } from '../components/scenarios/WithdrawalStrategyForm';
import { investmentTypeStorage } from '../services/investmentTypeStorage';
import {
  ScenarioRaw,
  InvestmentTypeRaw,
  InvestmentRaw,
  IncomeEventRaw,
  ExpenseEventRaw,
  InvestmentEventRaw,
  RebalanceEventRaw,
  EventRaw,
} from '../types/Scenarios';

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
  if (scenarioDetails.type === 'couple' && scenarioDetails.spouseBirthYear) {
    birthYears.push(scenarioDetails.spouseBirthYear);
  }

  // Map life expectancy
  const lifeExpectancy: Array<{ [key: string]: any }> = [];
  if (lifeExpectancyConfig.userExpectancyType === 'fixed') {
    lifeExpectancy.push({
      type: 'fixed',
      value: lifeExpectancyConfig.userFixedAge,
    });
  } else {
    lifeExpectancy.push({
      type: 'normal',
      mean: lifeExpectancyConfig.userMeanAge,
      stdev: lifeExpectancyConfig.userStandardDeviation,
    });
  }

  if (scenarioDetails.type === 'couple' && lifeExpectancyConfig.spouseExpectancyType) {
    if (lifeExpectancyConfig.spouseExpectancyType === 'fixed') {
      lifeExpectancy.push({
        type: 'fixed',
        value: lifeExpectancyConfig.spouseFixedAge,
      });
    } else {
      lifeExpectancy.push({
        type: 'normal',
        mean: lifeExpectancyConfig.spouseMeanAge,
        stdev: lifeExpectancyConfig.spouseStandardDeviation,
      });
    }
  }

  const inflation_assumption = (() => {
    if (additionalSettings.inflationConfig.type === 'fixed') {
      return {
        type: 'fixed',
        value: additionalSettings.inflationConfig.value,
      };
    } else if (additionalSettings.inflationConfig.type === 'uniform') {
      return {
        type: 'uniform',
        lower: additionalSettings.inflationConfig.min,
        upper: additionalSettings.inflationConfig.max,
      };
    } else {
      return {
        type: 'normal',
        mean: additionalSettings.inflationConfig.mean,
        stdev: additionalSettings.inflationConfig.standardDeviation,
      };
    }
  })();

  console.log('you are now at the inflation assumption section');
  console.log('Inflation assumption:', inflation_assumption);

  // Map investment types
  const allInvestmentTypes = investmentTypeStorage.get_all();
  console.log('All investment types before mapping:', allInvestmentTypes);

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
    investmentsConfig.investments.map(inv => ({
      investmentType: inv.investmentType || '',
      value: inv.value || 0,
      taxStatus: inv.taxStatus.toLowerCase().replace(/_/g, '-') || 'non-retirement',
      id: inv.id,
    }))
  );

  // Map events
  const eventSeries = new Set(
    addedEvents.map((event: any) => {
      // Map start and duration to match YAML schema format
      const startDist = event.startYear ? [{
        type: event.startYear.type || "fixed",
        ...(event.startYear.type === "fixed" ? { value: event.startYear.value } :
          event.startYear.type === "normal" ? { mean: event.startYear.mean, stdev: event.startYear.stdev } :
          event.startYear.type === "uniform" ? { lower: event.startYear.min, upper: event.startYear.max } :
          event.startYear.type === "startWith" || event.startYear.type === "startAfter" ? { eventSeries: event.startYear.eventSeries } : {})
      }] : [{ type: "fixed", value: 2025 }];

      const durationDist = event.duration ? [{
        type: event.duration.type || "fixed",
        ...(event.duration.type === "fixed" ? { value: event.duration.value } :
          event.duration.type === "normal" ? { mean: event.duration.mean, stdev: event.duration.stdev } :
          event.duration.type === "uniform" ? { lower: event.duration.min, upper: event.duration.max } : {})
      }] : [{ type: "fixed", value: 1 }];
      
      const baseEvent = {
        name: event.name,
        start: startDist,
        duration: durationDist,
        type: event.type || '',
      };

      if (event.type === 'income') {
        return {
          ...baseEvent,
          initialAmount: event.initialAmount || 0,
          changeAmtOrPct: event.changeType || 'percent',
          changeDistribution: event.changeDistribution || [],
          inflationAdjusted: event.inflationAdjusted || false,
          userFraction: (event.userPercentage ?? 100) / 100,
          socialSecurity: event.isSocialSecurity || false,
        } as IncomeEventRaw;
      } else if (event.type === 'expense') {
        return {
          ...baseEvent,
          initialAmount: event.initialAmount || 0,
          changeAmtOrPct: event.changeType || 'percent',
          changeDistribution: event.changeDistribution || [],
          inflationAdjusted: event.inflationAdjusted || false,
          userFraction: (event.userPercentage ?? 100) / 100,
          discretionary: event.discretionary || false,
        } as ExpenseEventRaw;
      } else if (event.type === 'invest') {
        return {
          ...baseEvent,
          assetAllocation: event.assetAllocation || [],
          assetAllocation2: event.assetAllocation2 || event.assetAllocation || [], // Use assetAllocation2 if provided, otherwise fallback to assetAllocation
          glidePath: event.glidePath || false,
          maxCash: event.maxCash || 0,
        } as InvestmentEventRaw;
      } else if (event.type === 'rebalance') {
        return {
          ...baseEvent,
          assetAllocation: event.assetAllocation || [],
        } as RebalanceEventRaw;
      }
      return baseEvent as EventRaw;
    })
  ) as unknown as Set<IncomeEventRaw | ExpenseEventRaw | InvestmentEventRaw | RebalanceEventRaw>;

  // Return the final ScenarioRaw object
  return {
    name: scenarioDetails.name,
    maritalStatus: scenarioDetails.type === 'couple' ? 'couple' : 'individual',
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
    financialGoal: additionalSettings.financialGoal,
    residenceState: additionalSettings.stateOfResidence,
  };
}
