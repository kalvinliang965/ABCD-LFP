import { IncomeEventRaw, ExpenseEventRaw, InvestEventRaw, RebalanceEventRaw, EventUnionRaw, create_income_event_raw, create_invest_event_raw } from "./raw/event_raw/event_raw";
import create_income_event, { IncomeEvent } from "./event/IncomeEvent";
import create_expense_event, { ExpenseEvent } from "./event/ExpenseEvent";
import create_invest_event from "./event/InvestEvent";
import create_rebalance_event, { RebalanceEvent } from "./event/RebalanceEvent";
import { InvestEvent } from "./event/InvestEvent";
import { simulation_logger } from "../../utils/logger/logger";
import { clone_map } from "../../utils/helper";
import Deque from "double-ended-queue";
import { EventUnion } from "./event/Event";

export type InvestEventMap = Map<string, InvestEvent>;
export type IncomeEventMap = Map<string, IncomeEvent>;
export type RebalanceEventMap = Map<string, RebalanceEvent>;
export type ExpenseEventMap = Map<string, ExpenseEvent>;

function is_event_active(event: EventUnion, year: number): boolean {
  const startYear = event.start || 0;
  const endYear = event.start + event.duration;
  return year >= startYear && year <= endYear;
}

function differentiate_events(
    eventSeries: Array<EventUnion>
): [IncomeEventMap, ExpenseEventMap, InvestEventMap, RebalanceEventMap] {
    const income_event_map = new Map<string, IncomeEvent>();
    const expense_event_map = new Map<string, ExpenseEvent>();
    const invest_event_map = new Map<string, InvestEvent>();
    const rebalance_event_map = new Map<string, RebalanceEvent>();
    for (const event of eventSeries) {
        switch (event.type) {
            case "income":
                income_event_map.set(event.name, event as IncomeEvent);
                break;
            case "expense":
                expense_event_map.set(event.name, event as ExpenseEvent);
                break;
            case "invest":
                invest_event_map.set(event.name, event as InvestEvent);
                break;
            case "rebalance":
                rebalance_event_map.set(event.name, event as RebalanceEvent);
                break;
            default:
                throw new Error(`Unknown event type: ${event.type}`);
        }
    }
    return [income_event_map, expense_event_map, invest_event_map, rebalance_event_map];
}

export interface EventManager {
    clone: () => EventManager;
    get_active_income_event: (year: number) => Array<IncomeEvent>;
    get_active_invest_event: (year: number) => Array<InvestEvent>;
    get_active_rebalance_event: (year: number) => Array<RebalanceEvent>;
    _income_event: IncomeEventMap,
    _expense_event: ExpenseEventMap,
    _invest_event: InvestEventMap,
    _rebalance_event: RebalanceEventMap,
}

function create_event_manager_clone(
    income_event: IncomeEventMap,
    expense_event: ExpenseEventMap,
    invest_event: InvestEventMap,
    rebalance_event: RebalanceEventMap,
): EventManager {

    return {
        _income_event: income_event,
        _expense_event: expense_event,
        _invest_event: invest_event,
        _rebalance_event: rebalance_event,
        get_active_income_event: (year: number) => Array.from(income_event.values())
                                .filter((event: IncomeEvent) => is_event_active(event, year)),
        get_active_invest_event: (year: number) => Array.from(invest_event.values())
                                .filter((event: InvestEvent) => is_event_active(event, year)),
        get_active_rebalance_event: (year: number) => Array.from(rebalance_event.values())
                                .filter((event: RebalanceEvent) => is_event_active(event, year)),
        clone: () => create_event_manager_clone(
            clone_map(income_event),
            clone_map(expense_event),
            clone_map(invest_event),
            clone_map(rebalance_event),
        )
    }
}

function resolve_event(event: EventUnionRaw): EventUnion {
    switch (event.type) {
        case "income":
            return create_income_event(event as IncomeEventRaw);
        case "expense":
            return create_expense_event(event as ExpenseEventRaw);
        case "invest":
            return create_invest_event(event as InvestEventRaw);
        case "rebalance":
            return create_rebalance_event(event as RebalanceEventRaw);
        default:
            throw new Error(`Unknown event type: ${event.type}`);
    }
}

export function resolve_event_chain(
    event_series: Set<EventUnionRaw>
  ): Array<EventUnion> {
    const event_map = new Map<string, EventUnionRaw>();
    const adj = new Map<string, string[]>();
    const in_degree = new Map<string, number>();
    const processing_queue = new Deque<string>();
    const resolved_events: EventUnion[] = [];
  
    try {
      // initialize the graph
      for (const event of event_series) {
        if (event_map.has(event.name)) {
            simulation_logger.error(`Duplicate event name: ${event.name}`);
            throw new Error(`Duplicate event name: ${event.name}`);
        }
        
        event_map.set(event.name, event);
        const startType = event.start.get("type");
        if (startType === "startWith" || startType === "endWith") {
          const dependencyName = event.start.get("eventSeries");
          if (!dependencyName) {
            simulation_logger.error(`Event ${event.name} missing eventSeries`);
            throw new Error(`Event ${event.name} missing eventSeries`);
          }
          if (!adj.has(dependencyName)) {
            adj.set(dependencyName, []);
          }
          adj.get(dependencyName)!.push(event.name);
          in_degree.set(event.name, (in_degree.get(event.name) || 0) + 1);
        } 
        // no dependency
        else {
          processing_queue.push(event.name);
          in_degree.set(event.name, 0);
        }
      }
  
      let processed_count = 0;
      while (!processing_queue.isEmpty()) {
        const current_event_name = processing_queue.shift()!;
        const current_event = event_map.get(current_event_name);
        if (!current_event) {
            simulation_logger.error(`Event ${current_event} not registered`);
            throw new Error(`Event ${current_event_name} not registered`);
        }
        
        const resolved_event = resolve_event(current_event)
        resolved_events.push(resolved_event);
        processed_count++;
  
        adj.get(current_event_name)?.forEach(dependent_event_name => {
            const updated_degree = in_degree.get(dependent_event_name)! - 1;
            in_degree.set(dependent_event_name, updated_degree);
            if (updated_degree === 0) {
                const dependent_event = event_map.get(dependent_event_name)!;
                if (dependent_event.start.get("type")! === "startWith") {
                    dependent_event.start = new Map<string, any>([
                        ["type", "fixed"],
                        ["value", resolved_event.start],
                    ])
                } 
                // endWith
                else {
                    dependent_event.start = new Map<string, any>([
                        ["type", "fixed"],
                        ["value", resolved_event.start + resolved_event.duration],
                    ])
                }
                processing_queue.push(dependent_event_name);
            }
        });
      }
  
      // Sanity check
      if (processed_count !== event_series.size) {
        // const unresolved = [...event_series].filter(
        //   e => resolved_events.map((el) => el.name).includes(e)
        // );
        // throw new Error(`Unresolvable event chain. Processed: ${processed_count}, Unresolved events: ${unresolved.map(e => e.name).join(", ")}`);
        throw new Error(`Unresolvable event chain.`);
      }
  
      return resolved_events;
    } catch (error) {
      simulation_logger.error("Event chain resolution failed", {
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

export function create_event_manager(event_series: Set<EventUnionRaw>): EventManager {
    try {
        const resolve_event = resolve_event_chain(event_series);
        const [income_event, expense_event, invest_event, rebalance_event] = differentiate_events(resolve_event);
        simulation_logger.info("Successfully created event manager");
        return create_event_manager_clone(income_event, expense_event, invest_event, rebalance_event);
    } catch(error) {
        console.error(error instanceof Error? error.stack: error);
        simulation_logger.error("Failed to create the event manager", {
            error: error instanceof Error? error.stack: error,
        });
        throw new Error(`Failed to create the event manager ${error instanceof Error? error.message: error}`);
    }
}