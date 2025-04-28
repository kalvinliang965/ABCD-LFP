import create_value_generator from "../../../utils/ValueGenerator";
import { DistributionType } from "../../Enums";
import { StatisticType } from "../../Enums";
import { simulation_logger } from "../../../utils/logger/logger";
import { ValueGenerator } from "../../../utils/ValueGenerator";

export type Distribution = {
      type: 'fixed' | "normal" | "uniform";
      value?: number; 
      mean?: number; 
      stdev?: number;
      lower?: number;
      upper?: number;
}

export type StartCondition = {
    type: 'startWith' | 'startAfter' | "fixed" | "normal" | "uniform";
    eventSeries?: string;
    value?: number;
    mean?: number;
    stdev?: number;
    lower?: number;
    upper?: number;
}


export function parse_start_condition(
    start: StartCondition
): ValueGenerator{
    if (start.type === "startWith" || start.type === "startAfter") {
        throw new Error(`Cannot resolve start condition of ${start.type}`);
    }

    return parse_distribution(start as Distribution);
}

export function parse_distribution(
  distribution: Distribution 
): ValueGenerator {
  try {
    switch (distribution.type) {
      case "fixed":
        const value = distribution.value;
        if (value === undefined || value === null) {
          simulation_logger.error("distribution has type fixed without value")
          throw new Error(`distribution has type fixed without value`);
        }
        return create_value_generator(
          DistributionType.FIXED,
          new Map([[StatisticType.VALUE, value]])
        );
      case "normal":

        const mean = distribution.mean;
        if (mean === undefined || mean === null) {
          simulation_logger.error("distribution has type normal without mean")
          throw new Error(`distribution has type fixed without mean`);
        }
        const stdev = distribution.stdev;
        if (stdev === undefined || stdev === null) {
          simulation_logger.error("distribution has type normal without stdev")
          throw new Error(`distribution has type fixed without stdev`);
        }
        return create_value_generator(
          DistributionType.NORMAL,
          new Map([
            [StatisticType.MEAN, mean],
            [StatisticType.STDEV, stdev],
          ])
        );
      case "uniform":
        const lower = distribution.lower;
        if (lower === undefined || lower === null) {
          simulation_logger.error("distribution has type uniform without lower")
          throw new Error(`distribution has type fixed without lower`);
        }
        const upper = distribution.upper;
        if (upper === undefined || upper === null) {
          simulation_logger.error("distribution has type normal without upper");
          throw new Error(`distribution has type fixed without upper`);
        }
        return create_value_generator(
          DistributionType.UNIFORM,
          new Map([
            [StatisticType.LOWER, lower],
            [StatisticType.UPPER, upper],
          ])
        );
      default:
        throw new Error(
          `distribution type is invalid ${distribution}`
        );
    }
  } catch (error) {
    throw new Error(
      `Failed to parse inflation assumption ${error instanceof Error? error.message: String(error)}`
    );
  }
}