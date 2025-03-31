import { EventRaw } from "./event_raw";

export type IncomeEventRaw = EventRaw & {
  initialAmount: number;
  changeAmtOrPct: string;
  changeDistribution: Map<string, any>;
  inflationAdjusted: boolean;
  userFraction: number;
  socialSecurity: boolean;
};

export const salary_income_one: IncomeEventRaw = create_income_event_raw(
    "salary",
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 2025],
    ]),
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 40],
    ]),
    75000,
    "amount",
    new Map<string, any>([
        ["type", "uniform"],
        ["lower", 500],
        ["upper", 2000],
    ]),
    false,
    1.0,
    false,
)


export function create_income_event_raw(
    name: string,
    start: Map<string, any>,
    duration: Map<string, any>,
    initialAmount: number,
    changeAmtOrPct: string,
    changeDistribution: Map<string, any>,
    inflationAdjusted: boolean,
    userFraction: number,
    socialSecurity: boolean,
): IncomeEventRaw {

    return {
        name,
        start,
        duration,
        type: "income", 
        initialAmount,
        changeAmtOrPct,
        changeDistribution,
        inflationAdjusted,
        userFraction,
        socialSecurity,
    }
}