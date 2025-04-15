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

  console.log("eventSeries:", serializedScenario.eventSeries);

  // Helper function to ensure numbers are parsed correctly
  const ensure_number = (val: any, key?: string): any => {
    if (val === null || val === undefined) return val;
    // Skip number conversion for descriptions
    if (key === "description") return String(val);
    if (typeof val === "string") {
      // Try to convert string to number if it looks like a number
      const num = Number(val);
      return !isNaN(num) ? num : val;
    }
    return val;
  };

  // Recursive function to process all values in an object
  const process_values = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => process_values(item));
    }

    if (typeof obj === "object") {
      const result: any = {};
      for (const key in obj) {
        result[key] =
          key === "description" ? String(obj[key]) : process_values(obj[key]);
      }
      return result;
    }

    return ensure_number(obj);
  };

  // Create a structured object that matches the expected YAML format
  const yamlObject: any = {
    // Add comment header with version information
    // Special formatting for the header comments
    name: serializedScenario.name,
    maritalStatus: serializedScenario.maritalStatus,
    birthYears: serializedScenario.birthYears.map(ensure_number),
    lifeExpectancy: serializedScenario.lifeExpectancy.map(process_values),

    // Convert array of investment types to the expected format
    investmentTypes: serializedScenario.investmentTypes.map((invType: any) => {
      console.log("invType:", invType);
      const processed = process_values({
        name: invType.name,
        description: String(invType.description),
        returnAmtOrPct: invType.returnAmtOrPct,
        returnDistribution: process_values(invType.returnDistribution[0]),
        expenseRatio: ensure_number(invType.expenseRatio),
        incomeAmtOrPct: invType.incomeAmtOrPct,
        incomeDistribution: process_values(invType.incomeDistribution[0]),
        taxability: invType.taxability,
      });

      // Ensure description is always a string after processing
      processed.description = String(processed.description);
      return processed;
    }),

    // Convert investments to the expected format
    investments: serializedScenario.investments.map((inv: any) =>
      process_values({
        investmentType: inv.investmentType,
        value: ensure_number(inv.value),
        taxStatus: inv.taxStatus,
        id: inv.id,
      })
    ),

    // Convert event series to the expected format
    eventSeries: serializedScenario.eventSeries.map((event: any) => {
      const baseEvent = {
        name: event.name,
        start: process_values(event.start[0]),
        duration: process_values(event.duration[0]),
        type: event.type,
      };

      // Add type-specific properties based on event type
      if (event.type === "income") {
        return process_values({
          ...baseEvent,
          initialAmount: ensure_number(event.initialAmount),
          changeAmtOrPct: event.changeAmtOrPct,
          changeDistribution: process_values(event.changeDistribution[0]),
          inflationAdjusted: event.inflationAdjusted,
          userFraction: ensure_number(event.userFraction),
          socialSecurity: event.socialSecurity,
        });
      } else if (event.type === "expense") {
        return process_values({
          ...baseEvent,
          initialAmount: ensure_number(event.initialAmount),
          changeAmtOrPct: event.changeAmtOrPct,
          changeDistribution: process_values(event.changeDistribution[0]),
          inflationAdjusted: event.inflationAdjusted,
          userFraction: ensure_number(event.userFraction),
          discretionary: event.discretionary,
        });
      } else if (event.type === "invest") {
        // Convert assetAllocation format from array to object
        const assetAllocation: Record<string, number> = {};
        const assetAllocation2: Record<string, number> = {};

        for (const [key, value] of Object.entries(event.assetAllocation)) {
          assetAllocation[key] = ensure_number(value);
        }
        //! here is the issues
        for (const [key, value] of Object.entries(event.assetAllocation2)) {
          assetAllocation2[key] = ensure_number(value);
        }

        return process_values({
          ...baseEvent,
          assetAllocation,
          glidePath: event.glidePath,
          assetAllocation2: event.glidePath ? assetAllocation2 : undefined,
          maxCash: ensure_number(event.maxCash),
        });
      } else if (event.type === "rebalance") {
        // Convert assetAllocation format from array to object
        const assetAllocation: Record<string, number> = {};
        console.log("checking if assetAllocation is an array:", typeof (event.assetAllocation));
        for (const [key, value] of Object.entries(event.assetAllocation)) {
          assetAllocation[key] = ensure_number(value);
        }

        return process_values({
          ...baseEvent,
          assetAllocation,
        });
      }

      return baseEvent;
    }),

    inflationAssumption: process_values(serializedScenario.inflationAssumption),
    afterTaxContributionLimit: ensure_number(
      serializedScenario.afterTaxContributionLimit
    ),
    spendingStrategy: serializedScenario.spendingStrategy,
    expenseWithdrawalStrategy: serializedScenario.expenseWithdrawalStrategy,
    RMDStrategy: serializedScenario.RMDStrategy,
    RothConversionOpt: serializedScenario.RothConversionOpt,
    RothConversionStart: ensure_number(serializedScenario.RothConversionStart),
    RothConversionEnd: ensure_number(serializedScenario.RothConversionEnd),
    RothConversionStrategy: serializedScenario.RothConversionStrategy,
    financialGoal: ensure_number(serializedScenario.financialGoal),
    residenceState: serializedScenario.residenceState,
  };

  console.log("yamlObject", yamlObject);

  // Pass skipInvalid:false to ensure valid YAML and noQuotes:true to ensure strings are properly quoted only when needed
  return dump(yamlObject, {
    skipInvalid: false,
    noCompatMode: true,
    lineWidth: -1, // Don't wrap lines
  });
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
