
import { DistributionType, StatisticType } from "../../core/Enums";
import { rnorm } from "probability-distributions";

function ValueGenerator(distribution_type: DistributionType, params: Map<StatisticType, number> ) {
    const sample = () => {
        switch (distribution_type) {
            case DistributionType.FIXED: 
                return params.get(StatisticType.VALUE);
            case DistributionType.NORMAL:
                const mean = params.get(StatisticType.MEAN);
                if (!mean) {
                    throw new Error("selecting value from normal distribution without `mean`");
                }
                const standard_deviation = params.get(StatisticType.STANDARD_DEVIATION);
                if (!standard_deviation) {
                    throw new Error("selecting value from normal distribution without 'standard deviation'");
                }
                return rnorm(1, mean, standard_deviation);
            case DistributionType.UNIFORM:
                const lowerbound = params.get(StatisticType.LOWERBOUND);
                if (!lowerbound) {
                    throw new Error("selecting value from uniform distribution without lowerbound");
                }
                const upperbound = params.get(StatisticType.UPPERBOUND);       
                if (!upperbound) {
                    throw new Error("selecting value from uniform distribution without upperbound");
                }
                return Math.random() * (upperbound - lowerbound) + lowerbound;
            default:
                throw new Error(`Invalid distribution type: ${distribution_type}`);
        }
    }
    return {
        sample
    }
}

export default ValueGenerator;