
import { EventRaw } from "./event_raw";

export type InvestmentEventRaw = EventRaw & {
  assetAllocation: Map<string, number>;
  assetAllocation2: Map<string, number>;
  glidePath: boolean;
  maxCash: number;
};

export const my_investments_investment_one: InvestmentEventRaw = create_invest_event_raw(
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
    new Map<string, number>([
        ["S&P 500 non-retirement", 0.6],
        ["S&P 500 after-tax", 0.4],
    ]),
    true,
    new Map<string, any>([
        ["S&P 500 non-retirement", 0.8],
        ["S&P 500 after-tax", 0.2],
    ]),
    1000,
)


export function create_invest_event_raw(
    name: string,
    start: Map<string, any>,
    duration: Map<string, any>,
    assetAllocation: Map<string, number>,
    glidePath: boolean,
    assetAllocation2: Map<string, number>,
    maxCash: number
): InvestmentEventRaw {

    return {
        name,
        start,
        duration,
        type: "investment", 
        assetAllocation,
        glidePath,
        assetAllocation2,
        maxCash,
    }
}