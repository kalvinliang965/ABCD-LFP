import { Distribution, StartCondition } from "../common";
import { ExpenseEventRaw } from "./expense_event_raw";
import { IncomeEventRaw } from "./income_event_raw";
import { InvestEventRaw } from "./investment_event_raw";
import { RebalanceEventRaw } from "./rebalance_event_raw";

export * from "./expense_event_raw"
export * from "./income_event_raw"
export * from "./investment_event_raw"
export * from "./rebalance_event_raw"

export type EventRaw = {
  name: string;
  start: StartCondition;
  duration: Distribution;
  type: "income" | "expense" | "invest" | "rebalance";
};

export function is_event(event: unknown): event is EventRaw {
  return (
    typeof event === 'object' &&
    event !== null &&
    'name' in event &&
    typeof (event as any).name === 'string' &&
    'start' in event &&
    typeof (event as any).start === 'object' &&
    event.start !== null &&
    'duration' in event &&
    typeof (event as any).duration === 'object' &&
    event.duration !== null &&
    'type' in event &&
    ['income', 'expense', 'invest', 'rebalance'].includes((event as any).type)
  );
}

export type EventUnionRaw = ExpenseEventRaw | InvestEventRaw | RebalanceEventRaw | IncomeEventRaw;
