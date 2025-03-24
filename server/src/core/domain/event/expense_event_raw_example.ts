import { ExpenseEventRaw } from "../scenario/Scenario";


export const food_expense_one = create_expense_event_raw(
    "food",
    new Map<string, any>([
        ["type", "startWith"],
        ["eventSeries", "salary"],
    ]),
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 200],
    ]),
    5000,
    "percent",
    new Map<string, any>([
        ["type", "normal"],
        ["mean", 0.02],
        ["stdev", 0.01],
    ]),
    true,
    0.5,
    false,
);

export const vacation_expense_one = create_expense_event_raw(
    "vacation",
    new Map<string, any>([
        ["type", "startWith"],
        ["eventSeries", "salary"],
    ]),
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 40],
    ]),
    1200,
    "amount",
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 0],
    ]),
    true,
    0.6,
    true,

);


export const streaming_services_expense_one = create_expense_event_raw(
    "streaming services",
    new Map<string, any>([
        ["type", "startWith"],
        ["eventSeries", "salary"],
    ]),
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 40],
    ]),
    500,
    "amount",
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 0],
    ]),
    true,
    1.0,
    true,
);

export function create_expense_event_raw(
    name: string,
    start: Map<string, any>,
    duration: Map<string, any>,
    initialAmount: number,
    changeAmtOrPct: string,
    changeDistribution: Map<string, any>,
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