
import { ChangeType } from "../../../Enums";
import { Distribution, StartCondition } from "../common";
import { EventRaw } from "./event_raw";

export type ExpenseEventRaw = EventRaw & {
  initialAmount: number;
  changeAmtOrPct: "amount" | "percent";
  changeDistribution: Distribution;
  inflationAdjusted: boolean;
  userFraction: number;
  discretionary: boolean;
};

export const food_expense_one = create_expense_event_raw(
    "food",
    {
        type: "startWith",
        eventSeries: "salary",
    },
    { 
        type: "fixed",
        value: 200,
    },
    5000,
    "percent",
    {
        type: "normal",
        mean: 0.02,
        stdev: 0.01,
    },
    true,
    0.5,
    false,
);

export const vacation_expense_one = create_expense_event_raw(
    "vacation",
    {
        type: "startWith",
        eventSeries: "salary",
    },
    { 
        type: "fixed",
        value: 40,
    },
    1200,
    "amount",
    {
        type: "fixed",
        value: 0,
    },
    true,
    0.6,
    true,

);


export const streaming_services_expense_one = create_expense_event_raw(
    "streaming services",
    { 
        type: "startWith",
        eventSeries: "salary",
    },
    {
        type: "fixed",
        value: 40,
    },
    500,
    "amount",
    {
        type: "fixed",
        value: 0,
    },
    true,
    1.0,
    true,
);

export function create_expense_event_raw(
    name: string,
    start: StartCondition,
    duration: Distribution,
    initialAmount: number,
    changeAmtOrPct: "amount" | "percent",
    changeDistribution: Distribution,
    inflationAdjusted: boolean,
    userFraction: number,
    discretionary: boolean,
): ExpenseEventRaw {
    return {
        name, 
        start,
        duration,
        initialAmount,
        changeAmtOrPct,
        changeDistribution,
        inflationAdjusted,
        userFraction,
        discretionary,
        type: "expense",
    }
}