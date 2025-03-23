import ValueGenerator from "../../../utils/math/ValueGenerator";
import { ChangeType, DistributionType, StatisticType } from "../../Enums";


// Map to store the event start years during processing
let _event_start_years = new Map<string, number>();

/**1
 * Process a collection of events to resolve their start years including dependencies
 * @param events Collection of events to process
 * @returns Map of event names to their resolved start years
 */
function process_event_dependencies(events: EventRaw[]): Map<string, number> {
  _event_start_years = new Map<string, number>();

  // First pass: Process events with fixed, uniform, or normal start years
  for (const event of events) {
    if (
      event.start.get("type") !== "startWith" &&
      event.start.get("type") !== "startAfter"
    ) {
      const startYear = parse_start_year(event.start);
      _event_start_years.set(event.name, startYear);
    }
  }

  // Second pass: Resolve dependencies
  let hasUnresolvedDependencies = true;
  let iterations = 0;
  const MAX_ITERATIONS = 100; // Safety to prevent infinite loop

  while (hasUnresolvedDependencies && iterations < MAX_ITERATIONS) {
    hasUnresolvedDependencies = false;
    iterations++;

    for (const event of events) {
      // Skip events already processed
      if (_event_start_years.has(event.name)) continue;

      try {
        const startYear = parse_start_year(event.start);
        _event_start_years.set(event.name, startYear);
      } catch (error) {
        // Still has dependencies that aren't resolved
        hasUnresolvedDependencies = true;
      }
    }
}


function parse_duration(duration: Map<string, any>): number {
    switch (duration.get("type")) {
        case "fixed":
            return ValueGenerator(DistributionType.FIXED,  new Map([
                [StatisticType.VALUE, duration.get("value")]
            ])).sample();
        case "uniform":
            return ValueGenerator(DistributionType.UNIFORM, new Map([
                [StatisticType.LOWER, duration.get("lower")],
                [StatisticType.UPPER, duration.get("upper")]
            ])).sample();
        case "normal":
            return ValueGenerator(DistributionType.UNIFORM, new Map([
                [StatisticType.MEAN, duration.get("mean")],
                [StatisticType.STDDEV, duration.get("stdev")]
            ])).sample();
        default:
            throw new Error("Invalid start year type");            
    }
}

function parse_expected_annual_change(changeAmtOrPct: string, changeDistribution: Map<string, any>): [ChangeType, number] {

    function parse_change_amt__or_pct(): ChangeType {
        switch(changeAmtOrPct) {
            case "amount":
                return (ChangeType.FIXED);        
            case "percent":
                return (ChangeType.PERCENTAGE);
            default:
                throw new Error("Invalid changeAmtOrPct");
        }
    }

    function parse_change_distribution() {
        switch (changeDistribution.get("type")) {
            case "fixed":
                return ValueGenerator(DistributionType.FIXED,  new Map([
                    [StatisticType.VALUE, changeDistribution.get("value")]
                ])).sample();
            case "uniform":
                return ValueGenerator(DistributionType.UNIFORM, new Map([
                    [StatisticType.LOWER, changeDistribution.get("lower")],
                    [StatisticType.UPPER, changeDistribution.get("upper")]
                ])).sample();
            case "normal":
                return ValueGenerator(DistributionType.UNIFORM, new Map([
                    [StatisticType.MEAN, changeDistribution.get("mean")],
                    [StatisticType.STDDEV, changeDistribution.get("stdev")]
                ])).sample();
            default:
                throw new Error("Invalid change distribution type");            
        }
    }

    try {
        const change_type: ChangeType = parse_change_amt__or_pct();
        const change_distribution: number = parse_change_distribution();
        return [change_type, change_distribution];
    } catch (error) {
        throw error
    }
}


interface Event {
    name: string,
    start: number,
    duration: number,
    type: string,
}

export {
    parse_duration,
    parse_start_year,
    parse_expected_annual_change,
    Event,
}