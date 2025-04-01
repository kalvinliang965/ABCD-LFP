
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