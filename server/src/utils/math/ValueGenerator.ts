import { DistributionType, StatisticType } from "../../core/Enums";
import normal from "@stdlib/random-base-normal";

export interface RandomGenerator {
  sample: () => number;
  _params: Map<StatisticType, number>;
}
function ValueGenerator(
  distribution_type: DistributionType,
  params: Map<StatisticType, number>
): RandomGenerator {
  const sample = (): number => {
    switch (distribution_type) {
      case DistributionType.FIXED:
        const value = params.get(StatisticType.VALUE);
        if (typeof value !== "number") {
          throw new Error("selecting value for fixed type with out `value`");
        }
        return value;
      case DistributionType.NORMAL:
        const mean = params.get(StatisticType.MEAN);
        if (typeof mean !== "number") {
          throw new Error(
            "selecting value from normal distribution without `mean`"
          );
        }
        const standard_deviation = params.get(StatisticType.STDEV);
        if (typeof standard_deviation !== "number") {
          throw new Error(
            "selecting value from normal distribution without 'standard deviation'"
          );
        }
        return normal(mean, standard_deviation);

      case DistributionType.UNIFORM:
        const lowerbound = params.get(StatisticType.LOWER);
        if (typeof lowerbound !== "number") {
          throw new Error(
            "selecting value from uniform distribution without lowerbound"
          );
        }
        const upperbound = params.get(StatisticType.UPPER);
        if (typeof upperbound !== "number") {
          throw new Error(
            "selecting value from uniform distribution without upperbound"
          );
        }
        return Math.random() * (upperbound - lowerbound) + lowerbound;
      default:
        throw new Error(`Invalid distribution type: ${distribution_type}`);
    }
  };
  return {
    sample,
    _params: params, // for debug
  };
}

export default ValueGenerator;
