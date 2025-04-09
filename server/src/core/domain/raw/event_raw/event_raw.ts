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
  start: Map<string, any>;
  duration: Map<string, any>;
  type: string;
};


export type EventUnionRaw = ExpenseEventRaw | InvestEventRaw | RebalanceEventRaw | IncomeEventRaw;
