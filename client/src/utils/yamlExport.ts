// AI-generated code
// Create utility functions for converting ScenarioRaw to YAML format for export

import { dump } from "js-yaml";
import { ScenarioRaw } from "../types/Scenarios";
import { serialize_scenario_for_api } from "./serialization";

/**
 * Converts a ScenarioRaw object to a YAML format string
 * @param scenario The ScenarioRaw object to convert
 * @returns A string containing the YAML representation of the scenario
 */
export function convert_scenario_to_yaml(scenario: ScenarioRaw): string {
  // First, ensure all Sets are converted to Arrays
  const serializedScenario = serialize_scenario_for_api(scenario);

  console.log("Investment Types:", serializedScenario.investmentTypes);
  console.log("Asset Allocations:", serializedScenario.eventSeries.filter((e: any) => e.type === 'invest'));

  // Create a structured object that matches the expected YAML format
  const yamlObject: any = {
    // Add comment header with version information
    // Special formatting for the header comments
    name: serializedScenario.name,
    maritalStatus: serializedScenario.martialStatus, //fix spelling issue in original data
    birthYears: serializedScenario.birthYears,
    lifeExpectancy: serializedScenario.lifeExpectancy,

    // Convert array of investment types to the expected format
    investmentTypes: serializedScenario.investmentTypes.map((invType: any) => ({
      name: invType.name,
      description: invType.description,
      returnAmtOrPct: invType.returnAmtOrPct,
      returnDistribution: invType.returnDistribution[0],
      expenseRatio: invType.expenseRatio,
      incomeAmtOrPct: invType.incomeAmtOrPct,
      incomeDistribution: invType.incomeDistribution[0] ,
      taxability: invType.taxability,
    })),

    // Convert investments to the expected format
    investments: serializedScenario.investments.map((inv: any) => ({
      investmentType: inv.investmentType,
      value: inv.value,
      taxStatus: inv.taxStatus,
      id: inv.id,
    })),

    // Convert event series to the expected format
    eventSeries: serializedScenario.eventSeries.map((event: any) => {
      const baseEvent = {
        name: event.name,
        start: event.start[0],
        duration: event.duration[0],
        type: event.type,
      };

      // Add type-specific properties based on event type
      if (event.type === "income") {
        return {
          ...baseEvent,
          initialAmount: event.initialAmount,
          changeAmtOrPct: event.changeAmtOrPct,
          changeDistribution: event.changeDistribution[0],
          inflationAdjusted: event.inflationAdjusted,
          userFraction: event.userFraction,
          socialSecurity: event.socialSecurity,
        };
      } else if (event.type === "expense") {
        return {
          ...baseEvent,
          initialAmount: event.initialAmount,
          changeAmtOrPct: event.changeAmtOrPct,
          changeDistribution: event.changeDistribution[0],
          inflationAdjusted: event.inflationAdjusted,
          userFraction: event.userFraction,
          discretionary: event.discretionary,
        };
      } else if (event.type === "invest") {
        // Convert assetAllocation format from array to object
        const assetAllocation: Record<string, number> = {};
        const assetAllocation2: Record<string, number> = {};

        if (Array.isArray(event.assetAllocation)) {
          event.assetAllocation.forEach((allocation: any) => {
            assetAllocation[allocation.type] = allocation.value;
          });
        }

        if (Array.isArray(event.assetAllocation2)) {
          event.assetAllocation2.forEach((allocation: any) => {
            assetAllocation2[allocation.type] = allocation.value;
          });
        }

        return {
          ...baseEvent,
          assetAllocation,
          glidePath: event.glidePath,
          assetAllocation2: event.glidePath ? assetAllocation2 : undefined,
          maxCash: event.maxCash,
        };
      } else if (event.type === "rebalance") {
        // Convert assetAllocation format from array to object
        const assetAllocation: Record<string, number> = {};

        if (Array.isArray(event.assetAllocation)) {
          event.assetAllocation.forEach((allocation: any) => {
            assetAllocation[allocation.type] = allocation.value;
          });
        }

        return {
          ...baseEvent,
          assetAllocation,
        };
      }

      return baseEvent;
    }),

    inflationAssumption: serializedScenario.inflationAssumption[0],
    afterTaxContributionLimit: serializedScenario.afterTaxContributionLimit,
    spendingStrategy: serializedScenario.spendingStrategy,
    expenseWithdrawalStrategy: serializedScenario.expenseWithdrawalStrategy,
    RMDStrategy: serializedScenario.RMDStrategy,
    RothConversionOpt: serializedScenario.RothConversionOpt,
    RothConversionStart: serializedScenario.RothConversionStart,
    RothConversionEnd: serializedScenario.RothConversionEnd,
    RothConversionStrategy: serializedScenario.RothConversionStrategy,
    financialGoal: serializedScenario.financialGoal,
    residenceState: serializedScenario.residenceState,
  };

  console.log("yamlObject", yamlObject);

  return dump(yamlObject);
}

/**
 * Creates a downloadable YAML file from a ScenarioRaw object
 * @param scenario The ScenarioRaw object to convert to YAML
 */
export function download_scenario_as_yaml(scenario: ScenarioRaw) {
  // Convert scenario to YAML
  const yamlString = convert_scenario_to_yaml(scenario);

  // Create a Blob from the YAML string
  const blob = new Blob([yamlString], { type: "application/x-yaml" });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an anchor element and trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = `${scenario.name.replace(/\s+/g, "_")}.yaml`;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
