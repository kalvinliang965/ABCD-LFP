import create_value_generator from "../../../utils/math/ValueGenerator";
import { DistributionType } from "../../Enums";
import { StatisticType } from "../../Enums";
import { simulation_logger } from "../../../utils/logger/logger";
import { ValueGenerator } from "../../../utils/math/ValueGenerator";

export type Distribution = {
  type: 'fixed' | 'normal' | 'uniform';
  value?: number;
  mean?: number;
  stdev?: number;
  lower?: number;
  upper?: number;
};

export type StartCondition = {
  type: 'fixed' | 'startWith' | 'startAfter' | 'uniform';
  value?: number;
  eventSeries?: string;
  lower?: number;
  upper?: number;
};



export function parse_distribution(
  distribution: Distribution 
): ValueGenerator {
  try {
    switch (distribution.type) {
      case "fixed":
        const value = distribution.value;
        if (value === undefined || value === null) {
          simulation_logger.error("Inflation assumption has type fixed without value")
          throw new Error(`Inflation assumption has type fixed without value`);
        }
        return create_value_generator(
          DistributionType.FIXED,
          new Map([[StatisticType.VALUE, value]])
        );
      case "normal":

        const mean = distribution.mean;
        if (mean === undefined || mean === null) {
          simulation_logger.error("Inflation assumption has type normal without mean")
          throw new Error(`Inflation assumption has type fixed without mean`);
        }
        const stdev = distribution.stdev;
        if (stdev === undefined || stdev === null) {
          simulation_logger.error("Inflation assumption has type normal without stdev")
          throw new Error(`Inflation assumption has type fixed without stdev`);
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
          simulation_logger.error("Inflation assumption has type uniform without lower")
          throw new Error(`Inflation assumption has type fixed without lower`);
        }
        const upper = distribution.upper;
        if (upper === undefined || upper === null) {
          simulation_logger.error("Inflation assumption has type normal without upper");
          throw new Error(`Inflation assumption has type fixed without upper`);
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
          `inflation assumption type is invalid ${distribution}`
        );
    }
  } catch (error) {
    throw new Error(
      `Failed to parse inflation assumption ${distribution}`
    );
  }
}