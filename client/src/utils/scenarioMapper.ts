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
        name: it.name.toLowerCase(),
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
      investmentType: inv.investmentType.toLowerCase() || '',
      value: inv.value || 0,
      taxStatus: inv.taxStatus.toLowerCase().replace(/_/g, '-') || 'non-retirement',
      id: inv.id,
    }))
  );

  // Map events
  const eventSeries = new Set(
    addedEvents.map((event: any) => {
      // Log the event data to help diagnose issues
      console.log('Processing event for API:', event.name, {
        startYear: event.startYear,
        start: event.start,
      });

      // Determine which field to use for start - some events have 'startYear', others 'start'
      const startConfig = event.startYear || event.start;

      if (!startConfig) {
        console.warn(`Event ${event.name} has no start configuration, using default`);
      }

      // Map start and duration to match YAML schema format as direct objects, not arrays
      const startObj = startConfig
        ? {
            type: startConfig.type || 'fixed',
            ...(startConfig.type === 'fixed'
              ? { value: startConfig.value ?? 2025 }
              : startConfig.type === 'normal'
              ? { mean: startConfig.mean ?? 2025, stdev: startConfig.stdev ?? 1 }
              : startConfig.type === 'uniform'
              ? { min: startConfig.min ?? 2025, max: startConfig.max ?? 2030 }
              : startConfig.type === 'startWith' || startConfig.type === 'startAfter'
              ? { eventSeries: startConfig.eventSeries ?? '' }
              : {}),
          }
        : { type: 'fixed', value: 2025 };

      // Log the mapped start configuration
      console.log('Mapped start configuration:', startObj);

      const durationObj = event.duration
        ? {
            type: event.duration.type || 'fixed',
            ...(event.duration.type === 'fixed'
              ? { value: event.duration.value ?? 1 }
              : event.duration.type === 'normal'
              ? { mean: event.duration.mean ?? 1, stdev: event.duration.stdev ?? 0 }
              : event.duration.type === 'uniform'
              ? { min: event.duration.min ?? 1, max: event.duration.max ?? 5 }
              : {}),
          }
        : { type: 'fixed', value: 1 };

      const baseEvent = {
        name: event.name,
        start: startObj,
        duration: durationObj,
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
        // Use assetAllocation directly as an object
        return {
          ...baseEvent,
          assetAllocation: event.assetAllocation || {},
          assetAllocation2:
            event.assetAllocation2 || (event.glidePath ? event.assetAllocation || {} : {}),
          glidePath: event.glidePath || false,
          maxCash: event.maxCash || 0,
        } as InvestmentEventRaw;
      } else if (event.type === 'rebalance') {
        // Use assetAllocation directly as an object
        return {
          ...baseEvent,
          assetAllocation: event.assetAllocation || {},
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
