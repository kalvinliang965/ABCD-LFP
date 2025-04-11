import { Cloneable } from "../../../utils/helper";
import  {create_value_generator,  ValueGenerator } from "../../../utils/math/ValueGenerator";
import { ChangeType, DistributionType, StatisticType } from "../../Enums";
import { EventRaw } from "../raw/event_raw/event_raw";
import { ExpenseEvent } from "./ExpenseEvent";
import { IncomeEvent } from "./IncomeEvent";
import { InvestEvent } from "./InvestEvent";
import { RebalanceEvent } from "./RebalanceEvent";

// Map to store the event start years during processing
let _event_start_years = new Map<string, number>();

function parse_start_year(start: Map<string, any>): number {
  switch (start.get("type")) {
    case "fixed":
      return create_value_generator(
        DistributionType.FIXED,
        new Map([[StatisticType.VALUE, start.get("value")]])
      ).sample();
    case "uniform":
      return create_value_generator(
        DistributionType.UNIFORM,
        new Map([
          [StatisticType.LOWER, start.get("lower")],
          [StatisticType.UPPER, start.get("upper")],
        ])
      ).sample();
    case "normal":
      return create_value_generator(
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
      return create_value_generator(
        DistributionType.FIXED,
        new Map([[StatisticType.VALUE, duration.get("value")]])
      ).sample();
    case "uniform":
      return create_value_generator(
        DistributionType.UNIFORM,
        new Map([
          [StatisticType.LOWER, duration.get("lower")],
          [StatisticType.UPPER, duration.get("upper")],
        ])
      ).sample();
    case "normal":
      return create_value_generator(
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
        return create_value_generator(
          DistributionType.FIXED,
          new Map([[StatisticType.VALUE, changeDistribution.get("value")]])
        );
      case "uniform":
        return create_value_generator(
          DistributionType.UNIFORM,
          new Map([
            [StatisticType.LOWER, changeDistribution.get("lower")],
            [StatisticType.UPPER, changeDistribution.get("upper")],
          ])
        );
      case "normal":
        return create_value_generator(
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

interface Event extends Cloneable<Event> {
  name: string;
  start: number;
  duration: number;
  type: string;
  clone(): Event;
}

export type EventUnion = IncomeEvent | ExpenseEvent | InvestEvent | RebalanceEvent;

export {
  parse_duration,
  parse_start_year,
  parse_expected_annual_change,
  Event,
};
