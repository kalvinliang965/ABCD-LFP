// AI-generated code
// Create utility functions for serializing Set objects to arrays for API calls

/**
 * Converts Set objects in a scenario to arrays for proper JSON serialization
 * Solves the issue where Set objects don't properly serialize when sending to backend
 * @param scenario The scenario object containing Set objects
 * @returns A new object with all Sets converted to arrays
 */
export function serialize_scenario_for_api(scenario: any) {
  console.log('scenario in serialize_scenario_for_api', scenario);
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

      // Handle start object - preserve all properties based on type
      console.log('Processing event:', event.name || 'Unnamed event');
      console.log(
        'Start config type:',
        event.start ? event.start.type : 'undefined',
        'Is object?',
        typeof event.start === 'object',
        'Is Map?',
        event.start instanceof Map
      );

      if (event.start) {
        // If start is a Map, convert to object
        if (event.start instanceof Map) {
          processedEvent.start = Object.fromEntries(event.start);
          console.log('Converted start Map to object:', processedEvent.start);
        } else if (typeof event.start === 'object') {
          // For objects, preserve the full structure (including type and all properties)
          processedEvent.start = { ...event.start };
          console.log('Preserved start object structure:', processedEvent.start);
        }
      }

      // Handle duration object - preserve all properties based on type
      console.log(
        'Duration config type:',
        event.duration ? event.duration.type : 'undefined',
        'Is object?',
        typeof event.duration === 'object',
        'Is Map?',
        event.duration instanceof Map
      );

      if (event.duration) {
        if (event.duration instanceof Map) {
          processedEvent.duration = Object.fromEntries(event.duration);
          console.log('Converted duration Map to object:', processedEvent.duration);
        } else if (typeof event.duration === 'object') {
          // For objects, preserve the full structure
          processedEvent.duration = { ...event.duration };
          console.log('Preserved duration object structure:', processedEvent.duration);
        }
      }

      // Handle changeDistribution object - preserve all properties based on type
      if (event.changeDistribution) {
        if (event.changeDistribution instanceof Map) {
          processedEvent.changeDistribution = Object.fromEntries(event.changeDistribution);
        } else if (typeof event.changeDistribution === 'object') {
          // For objects, preserve the full structure
          processedEvent.changeDistribution = { ...event.changeDistribution };
        }
      }

      // Handle assetAllocation - keep as object format
      if (event.assetAllocation) {
        // If it's a Map, convert to object
        if (event.assetAllocation instanceof Map) {
          processedEvent.assetAllocation = Object.fromEntries(event.assetAllocation.entries());
        }
        // If it's already an object but not an array, use it directly
        else if (
          typeof event.assetAllocation === 'object' &&
          !Array.isArray(event.assetAllocation)
        ) {
          processedEvent.assetAllocation = { ...event.assetAllocation };
        }
        // If it's an array, convert to object format
        else if (Array.isArray(event.assetAllocation)) {
          const assetAllocationObj: Record<string, number> = {};
          event.assetAllocation.forEach((item: any) => {
            if (item.type && item.value !== undefined) {
              assetAllocationObj[item.type] = Number(item.value);
            }
          });
          processedEvent.assetAllocation = assetAllocationObj;
        }
      }

      // Handle assetAllocation2 - keep as object format
      if (event.assetAllocation2) {
        // If it's a Map, convert to object
        if (event.assetAllocation2 instanceof Map) {
          processedEvent.assetAllocation2 = Object.fromEntries(event.assetAllocation2.entries());
        }
        // If it's already an object but not an array, use it directly
        else if (
          typeof event.assetAllocation2 === 'object' &&
          !Array.isArray(event.assetAllocation2)
        ) {
          processedEvent.assetAllocation2 = { ...event.assetAllocation2 };
        }
        // If it's an array, convert to object format
        else if (Array.isArray(event.assetAllocation2)) {
          const assetAllocationObj: Record<string, number> = {};
          event.assetAllocation2.forEach((item: any) => {
            if (item.type && item.value !== undefined) {
              assetAllocationObj[item.type] = Number(item.value);
            }
          });
          processedEvent.assetAllocation2 = assetAllocationObj;
        }
      }

      console.log('Final processed event', event.name, ':', {
        start: processedEvent.start,
        duration: processedEvent.duration,
      });

      return processedEvent;
    });
  }

  // Convert lifeExpectancy array of Distribution objects if it exists
  if (Array.isArray(serialized.lifeExpectancy)) {
    serialized.lifeExpectancy = serialized.lifeExpectancy.map((expectancy: any) => {
      if (expectancy instanceof Map) {
        return Object.fromEntries(expectancy);
      }
      return expectancy;
    });
  }

  // Convert inflationAssumption if it's a Map
  if (serialized.inflationAssumption instanceof Map) {
    serialized.inflationAssumption = Object.fromEntries(serialized.inflationAssumption);
  }

  // Convert any other arrays that may contain Sets
  [
    'spendingStrategy',
    'expenseWithdrawalStrategy',
    'RMDStrategy',
    'RothConversionStrategy',
  ].forEach(field => {
    if (serialized[field] instanceof Set) {
      serialized[field] = Array.from(serialized[field]);
    }
  });

  return serialized;
}

/**
 * Deserializes a scenario object from the API response back to the client's expected format
 * @param scenario The scenario object from the API
 * @returns A scenario object with appropriate Sets and Maps restored
 */
export function deserialize_scenario_from_api(scenario: any) {
  const deserialized = { ...scenario };

  // Convert investmentTypes array to Set if it exists
  if (Array.isArray(deserialized.investmentTypes)) {
    deserialized.investmentTypes = new Set(deserialized.investmentTypes);
  }

  // Convert investments array to Set if it exists
  if (Array.isArray(deserialized.investments)) {
    deserialized.investments = new Set(deserialized.investments);
  }

  // Convert eventSeries array to Set if it exists
  if (Array.isArray(deserialized.eventSeries)) {
    deserialized.eventSeries = new Set(
      deserialized.eventSeries.map((event: any) => {
        const processedEvent = { ...event };

        // Process start year configurations
        if (event.start) {
          console.log('Deserializing event start:', event.name, event.start);

          // Ensure start configuration is properly preserved based on type
          if (typeof event.start === 'object') {
            // Keep the object structure intact
            if (event.start.type === 'normal') {
              processedEvent.start = {
                type: 'normal',
                mean: event.start.mean,
                stdev: event.start.stdev,
              };
            } else if (event.start.type === 'uniform') {
              processedEvent.start = {
                type: 'uniform',
                min: event.start.min,
                max: event.start.max,
              };
            } else if (event.start.type === 'fixed') {
              processedEvent.start = {
                type: 'fixed',
                value: event.start.value,
              };
            } else if (event.start.type === 'startWith' || event.start.type === 'startAfter') {
              processedEvent.start = {
                type: event.start.type,
                eventSeries: event.start.eventSeries,
              };
            }

            console.log('Processed start config:', processedEvent.start);
          }
        }

        // Process duration configurations
        if (event.duration) {
          console.log('Deserializing event duration:', event.name, event.duration);

          // Ensure duration configuration is properly preserved based on type
          if (typeof event.duration === 'object') {
            // Keep the object structure intact
            if (event.duration.type === 'normal') {
              processedEvent.duration = {
                type: 'normal',
                mean: event.duration.mean,
                stdev: event.duration.stdev,
              };
            } else if (event.duration.type === 'uniform') {
              processedEvent.duration = {
                type: 'uniform',
                min: event.duration.min,
                max: event.duration.max,
              };
            } else if (event.duration.type === 'fixed') {
              processedEvent.duration = {
                type: 'fixed',
                value: event.duration.value,
              };
            }

            console.log('Processed duration config:', processedEvent.duration);
          }
        }

        return processedEvent;
      })
    );
  }

  return deserialized;
}
