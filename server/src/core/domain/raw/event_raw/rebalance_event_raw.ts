
import { Distribution, StartCondition } from "../common";
import { EventRaw } from "./event_raw";
export type RebalanceEventRaw = EventRaw & {
  assetAllocation: Record<string, number>;
};

export const rebalance_one: RebalanceEventRaw = create_rebalance_event_raw(
    "rebalance",
    {
        "type": "uniform",
        "lower": 2025,
        "upper": 2030,
    },
    { 
        "type": "fixed",
        "value": 10,
    },
    { 
        "S&P 500 non-retirement": 0.7,
        "tax-exempt bonds": 0.3,
    },
)


export function create_rebalance_event_raw(
    name: string,
    start: StartCondition,
    duration: Distribution,
    assetAllocation: Record<string, number>,
): RebalanceEventRaw {
    return {
        name,
        start,
        duration,
        type: "rebalance", 
        assetAllocation,
    }
}