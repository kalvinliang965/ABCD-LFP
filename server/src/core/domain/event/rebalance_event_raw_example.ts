
import { RebalanceEventRaw } from "../scenario/Scenario";


export const rebalance_one: RebalanceEventRaw = create_rebalance_event(
    "my investments",
    new Map<string, any>([
        ["type", "uniform"],
        ["lower", 2025],
        ["upper", 2030],
    ]),
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 10],
    ]),
    new Map<string, any>([
        ["S&P non-retirement", 0.7],
        ["tax-exempt bonds", 0.3],
    ]),
)


export function create_rebalance_event(
    name: string,
    start: Map<string, any>,
    duration: Map<string, any>,
    assetAllocation: Map<string, number>,
): RebalanceEventRaw {
    return {
        name,
        start,
        duration,
        type: "rebalance", 
        assetAllocation,
    }
}