import { DistributionType, StatisticType } from "../core/Enums";
import seedrandom from "seedrandom";

export interface ValueGenerator {
  sample: () => number;
  
  // below are the one for testing purposes
  _distribution_type: DistributionType;
  _value?: number;
  _mean?: number;
  _stdev?: number;
  _min?: number;
  _max?: number;
  equal: (that: ValueGenerator) => boolean;
}

export interface ValueSource {
   create_value_generator: (distribution_type: DistributionType, params: Map<StatisticType, number>) => ValueGenerator;
}

export function create_value_source(
  seed: string
): ValueSource {
  const rng = seedrandom(seed);

  function normal(mean = 0, stddev = 1) {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = rng();
    while (u2 === 0) u2 = rng();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stddev + mean;
  }

  function uniform(min: number, max: number) {
    return rng() * (max - min) + min;
  }

  return {
    create_value_generator: (
      distribution_type: DistributionType,
      params: Map<StatisticType, number>
    ): ValueGenerator => {
      let sample;
      switch (distribution_type) {
        case DistributionType.FIXED:
          const value = params.get(StatisticType.VALUE);
          console.log(params);
          if (typeof value !== "number") {
            throw new Error("selecting value for fixed type with out `value`");
          }
          sample = () => value;
          break;
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
          sample = () => normal(mean, standard_deviation);
          break;
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
          sample = () => uniform(lowerbound, upperbound);
          break;
        default:
          throw new Error(`Invalid distribution type: ${distribution_type}`);
        }

      return {
        sample,
        _distribution_type: distribution_type,
        _value: params.get(StatisticType.VALUE),
        _mean: params.get(StatisticType.MEAN),
        _stdev: params.get(StatisticType.STDEV),
        _min: params.get(StatisticType.LOWER),
        _max: params.get(StatisticType.UPPER),
        equal: (that: ValueGenerator) => {
          return (
            that._distribution_type === distribution_type &&
            that._mean === params.get(StatisticType.MEAN) &&
            that._stdev === params.get(StatisticType.STDEV) &&
            that._min === params.get(StatisticType.LOWER) &&
            that._max === params.get(StatisticType.UPPER) && 
            that._value === params.get(StatisticType.VALUE)
          );
        },
      } 
    }
  }
}


export function generate_seed(): string {
  const now = Date.now(); // current timestamp in ms
  const rand = Math.floor(Math.random() * 1e9); // random number up to 1 billion
  return `${now.toString(36)}-${rand.toString(36)}`; // base36 keeps it compact
}
