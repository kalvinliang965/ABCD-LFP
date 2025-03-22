import ValueGenerator from "../../../utils/math/ValueGenerator";
import { ChangeType, DistributionType, StatisticType } from "../../Enums";

function parse_start_year(start: Map<string, any>): number {
     
    switch(start.get("type")) {
        case "fixed":
            return ValueGenerator(DistributionType.FIXED,  new Map([
                [StatisticType.VALUE, start.get("value")]
            ])).sample();
        case "uniform":
            return ValueGenerator(DistributionType.UNIFORM, new Map([
                [StatisticType.LOWER, start.get("lower")],
                [StatisticType.UPPER, start.get("upper")]
            ])).sample();
        case "normal":
            return ValueGenerator(DistributionType.UNIFORM, new Map([
                [StatisticType.MEAN, start.get("mean")],
                [StatisticType.STDDEV, start.get("stdev")]
            ])).sample();
        case "startWith":
            // TODO
            throw new Error("TODO");
        default:
            throw new Error("Invalid start year type");            
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


interface EventObject {
    name: string,
    start: number,
    duration: number,
    type: string,
}

export {
    parse_duration,
    parse_start_year,
    parse_expected_annual_change,
    EventObject,
}