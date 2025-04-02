import ValueGenerator, { ValueGenerator } from "../../../utils/math/ValueGenerator";
import { ChangeType, DistributionType, StatisticType } from "../../Enums";
import { EventRaw } from "../raw/event_raw/event_raw";

// Map to store the event start years during processing
let _event_start_years = new Map<string, number>();

/**11
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

  if (iterations >= MAX_ITERATIONS) {
    throw new Error(
      "Circular dependencies detected in event series or dependencies couldn't be resolved"
    );
  }

  return new Map(_event_start_years);
}

function parse_start_year(start: Map<string, any>): number {
  switch (start.get("type")) {
    case "fixed":
      return ValueGenerator(
        DistributionType.FIXED,
        new Map([[StatisticType.VALUE, start.get("value")]])
      ).sample();
    case "uniform":
      return ValueGenerator(
        DistributionType.UNIFORM,
        new Map([
          [StatisticType.LOWER, start.get("lower")],
          [StatisticType.UPPER, start.get("upper")],
        ])
      ).sample();
    case "normal":
      return ValueGenerator(
        DistributionType.NORMAL,
        new Map([
          [StatisticType.MEAN, start.get("mean")],
          [StatisticType.STDEV, start.get("stdev")],
        ])
      ).sample();
    case "startWith":
      const referencedEventName = start.get("eventSeries");
      if (!referencedEventName) {
        throw new Error("No eventSeries name specified for startWith type");
      }
      const startYear = _event_start_years.get(referencedEventName);
      if (startYear === undefined) {
        throw new Error(
          `Referenced event '${referencedEventName}' not found or its start year is not yet determined`
        );
      }
      return startYear;
    case "startAfter":
      const afterEventName = start.get("eventSeries");
      if (!afterEventName) {
        throw new Error("No eventSeries name specified for startAfter type");
      }
      const refStartYear = _event_start_years.get(afterEventName);
      if (refStartYear === undefined) {
        throw new Error(
          `Referenced event '${afterEventName}' not found or its start year is not yet determined`
        );
      }
      // We need to find the duration of the referenced event
      // Since this requires additional context not available in this function,
      // a separate function would be needed to fully implement this.
      // For now, just adding a placeholder error.
      throw new Error(
        "startAfter implementation requires duration information"
      );
    default:
      throw new Error("Invalid start year type");
  }
}

function parse_duration(duration: Map<string, any>): number {
  switch (duration.get("type")) {
    case "fixed":
      return ValueGenerator(
        DistributionType.FIXED,
        new Map([[StatisticType.VALUE, duration.get("value")]])
      ).sample();
    case "uniform":
      return ValueGenerator(
        DistributionType.UNIFORM,
        new Map([
          [StatisticType.LOWER, duration.get("lower")],
          [StatisticType.UPPER, duration.get("upper")],
        ])
      ).sample();
    case "normal":
      return ValueGenerator(
        DistributionType.NORMAL,
        new Map([
          [StatisticType.MEAN, duration.get("mean")],
          [StatisticType.STDEV, duration.get("stdev")],
        ])
      ).sample();
    default:
      throw new Error("Invalid duration type");
  }
}

function parse_expected_annual_change(
  changeAmtOrPct: string,
  changeDistribution: Map<string, any>
): [ChangeType, ValueGenerator] {
  function parse_change_amt__or_pct(): ChangeType {
    switch (changeAmtOrPct) {
      case "amount":
        return ChangeType.FIXED;
      case "percent":
        return ChangeType.PERCENTAGE;
      default:
        throw new Error("Invalid changeAmtOrPct");
    }
  }

  function parse_change_distribution() {
    switch (changeDistribution.get("type")) {
      case "fixed":
        return ValueGenerator(
          DistributionType.FIXED,
          new Map([[StatisticType.VALUE, changeDistribution.get("value")]])
        );
      case "uniform":
        return ValueGenerator(
          DistributionType.UNIFORM,
          new Map([
            [StatisticType.LOWER, changeDistribution.get("lower")],
            [StatisticType.UPPER, changeDistribution.get("upper")],
          ])
        );
      case "normal":
        return ValueGenerator(
          DistributionType.NORMAL,
          new Map([
            [StatisticType.MEAN, changeDistribution.get("mean")],
            [StatisticType.STDEV, changeDistribution.get("stdev")],
          ])
        );
      default:
        throw new Error("Invalid change distribution type");
    }
  }

  try {
    const change_type: ChangeType = parse_change_amt__or_pct();
    const change_distribution: ValueGenerator = parse_change_distribution();
    return [change_type, change_distribution];
  } catch (error) {
    throw error;
  }
}

interface Event {
  name: string;
  start: number;
  duration: number;
  type: string;
  clone(): Event;
}

export {
  parse_duration,
  parse_start_year,
  parse_expected_annual_change,
  process_event_dependencies,
  Event,
};
