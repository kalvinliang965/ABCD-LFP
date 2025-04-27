import { Distribution, StartCondition } from "../common";
import { EventRaw } from "./event_raw";

export type IncomeEventRaw = EventRaw & {
  initialAmount: number;
  changeAmtOrPct: "amount" | "percent";
  changeDistribution: Distribution;
  inflationAdjusted: boolean;
  userFraction: number;
  socialSecurity: boolean;
};

export const salary_income_event_one: IncomeEventRaw = create_income_event_raw(
    "salary",
    { 
        type:"fixed",
        value: 2025,
    },
    {
        type: "fixed",
        value: 40,
    },
    75000,
    "amount",
    {
        type: "uniform",
        lower: 500,
        upper: 2000,
    },
    false,
    1.0,
    false,
)


export const ss_income_event_one: IncomeEventRaw = create_income_event_raw(
    "social security",
    {
        type: "fixed",
        value: 2025,
    },
    {
        type: "fixed",
        value: 40,
    },
    8000,
    "amount",
    {
        type: "uniform",
        lower: 500,
        upper: 2000,
    },
    false,
    1.0,
    true,
)

export function create_income_event_raw(
    name: string,
    start: StartCondition,
    duration: Distribution,
    initialAmount: number,
    changeAmtOrPct: "amount" | "percent",
    changeDistribution: Distribution,
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