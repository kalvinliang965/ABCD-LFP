import { DistributionType, StatisticType } from "../core/Enums";
import normal from "@stdlib/random-base-normal";

export interface ValueGenerator {
  sample: () => number;
  _params: Map<StatisticType, number>;
  _distribution_type: DistributionType;
  equal: (that: ValueGenerator) => boolean;
}
export function create_value_generator(
  distribution_type: DistributionType,
  params: Map<StatisticType, number>
): ValueGenerator {
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
    _params: params,
    _distribution_type: distribution_type,
    equal: (that: ValueGenerator): boolean => {
      if(
        params.size !== that._params.size ||
        distribution_type !== that._distribution_type
      ) return false;
      for (const [key, value] of params) {
        const that_value = that._params.get(key);
        if (typeof value === "number"&& typeof that_value == "number" &&
          isNaN(value) && isNaN(that_value)  
        ) {
          continue;
        }
        if (that_value !== value) {
          return false;
        }
      }
      return true
    }
  };
}

export default create_value_generator;