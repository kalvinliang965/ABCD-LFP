
import { Distribution, StartCondition } from "../common";
import { EventRaw } from "./event_raw";

export type InvestEventRaw = EventRaw & {
  assetAllocation: Record<string, number>;
  assetAllocation2: Record<string, number>;
  glidePath: boolean;
  maxCash: number;
};

export const my_investments_investment_one: InvestEventRaw = create_invest_event_raw(
    "my investments",
    { 
        type: "uniform",
        lower: 2025,
        upper: 2030,
    },
    { 
        type: "fixed",
        value: 10,
    },
    {
        "S&P 500 non-retirement": 0.6,
        "S&P 500 after-tax": 0.4,
    },
    true,
    {
        "S&P 500 non-retirement": 0.8,
        "S&P 500 after-tax": 0.2,
    },
    1000,
)


export function create_invest_event_raw(
    name: string,
    start: StartCondition,
    duration: Distribution,
    assetAllocation: Record<string, number>,
    glidePath: boolean,
    assetAllocation2: Record<string, number>,
    maxCash: number
): InvestEventRaw {

    return {
        name,
        start,
        duration,
        type: "invest", 
        assetAllocation,
        glidePath,
        assetAllocation2,
        maxCash,
    }
}