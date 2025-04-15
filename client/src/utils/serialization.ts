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
    serialized.eventSeries = Array.from(serialized.eventSeries).map((event: any) => {
      // Convert Map objects to plain objects
      const processedEvent = { ...event };

      // Handle start Map
      if (event.start instanceof Map) {
        const entries = Array.from(event.start.entries()) as [string, any][];
        processedEvent.start = entries.map(([key, value]) => ({
          [key]: value,
        }));
      }

      // Handle duration Map
      if (event.duration instanceof Map) {
        const entries = Array.from(event.duration.entries()) as [string, any][];
        processedEvent.duration = entries.map(([key, value]) => ({
          [key]: value,
        }));
      }

      // Handle changeDistribution Map
      if (event.changeDistribution instanceof Map) {
        const entries = Array.from(event.changeDistribution.entries()) as [string, any][];
        processedEvent.changeDistribution = entries.map(([key, value]) => ({
          [key]: value,
        }));
      }

      // Handle assetAllocation Map
      if (event.assetAllocation instanceof Map) {
        const entries = Array.from(event.assetAllocation.entries()) as [string, any][];
        processedEvent.assetAllocation = entries.map(([key, value]) => ({
          type: key,
          value: value,
        }));
      }

      // Handle assetAllocation2 Map
      if (event.assetAllocation2 instanceof Map) {
        const entries = Array.from(event.assetAllocation2.entries()) as [string, any][];
        processedEvent.assetAllocation2 = entries.map(([key, value]) => ({
          type: key,
          value: value,
        }));
      }

      return processedEvent;
    });
  }

  return serialized;
}
