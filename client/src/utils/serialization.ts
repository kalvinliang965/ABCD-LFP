// AI-generated code
// Create utility functions for serializing Set objects to arrays for API calls

/**
 * Converts Set objects in a scenario to arrays for proper JSON serialization
 * Solves the issue where Set objects don't properly serialize when sending to backend
 * @param scenario The scenario object containing Set objects
 * @returns A new object with all Sets converted to arrays
 */
export function serialize_scenario_for_api(scenario: any) {
  const serialized = { ...scenario };

  // Convert investmentTypes Set to array if it exists
  if (serialized.investmentTypes instanceof Set) {
    serialized.investmentTypes = Array.from(serialized.investmentTypes);
  }

  // Convert investments Set to array if it exists
  if (serialized.investments instanceof Set) {
    serialized.investments = Array.from(serialized.investments);
  }

  // Convert eventSeries Set to array if it exists
  if (serialized.eventSeries instanceof Set) {
    serialized.eventSeries = Array.from(serialized.eventSeries);
  }
  
  return serialized;
}
