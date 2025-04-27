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
import { ChangeType } from "../Enums";

export type InvestEventMap = Map<string, InvestEvent>;
export type IncomeEventMap = Map<string, IncomeEvent>;
export type RebalanceEventMap = Map<string, RebalanceEvent>;
export type ExpenseEventMap = Map<string, ExpenseEvent>;

export function is_event_active(event: EventUnion, year: number): boolean {
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
    get_active_mandatory_event: (year: number) => Array<ExpenseEvent>;
    get_active_discretionary_event: (year: number) => Array<ExpenseEvent>;
    income_event: IncomeEventMap,
    expense_event: ExpenseEventMap,
    invest_event: InvestEventMap,
    rebalance_event: RebalanceEventMap,
    get_income_breakdown: () => Record<string, number>;
    update_income_breakdown: (eventName: string, amount: number) => void;
    reset_income_breakdown: () => void;
    get_expense_breakdown: () => Record<string, number>;
    update_expense_breakdown: (eventName: string, amount: number) => void;
    reset_expense_breakdown: () => void;
    get_total_expenses: () => { mandatory: number; discretionary: number };
    update_total_expenses: (mandatory: number, discretionary: number) => void;
    get_last_year_tax_totals: () => { total: number } | undefined;
    update_last_year_tax_totals: (total: number) => void;
    update_initial_amount: (event: ExpenseEvent | IncomeEvent) => number;
}

export function create_event_manager_clone(
    income_event: IncomeEventMap,
    expense_event: ExpenseEventMap,
    invest_event: InvestEventMap,
    rebalance_event: RebalanceEventMap,
): EventManager {
    const income_breakdown: Record<string, number> = {};
    const expense_breakdown: Record<string, number> = {};
    let total_expenses = { mandatory: 0, discretionary: 0 };
    let last_year_tax_totals: { total: number } | undefined;

    return {
        income_event,
        expense_event,
        invest_event,
        rebalance_event,
        get_active_income_event: (year: number) => Array.from(income_event.values())
                                .filter((event: IncomeEvent) => is_event_active(event, year)),
        get_active_invest_event: (year: number) => Array.from(invest_event.values())
                                .filter((event: InvestEvent) => is_event_active(event, year)),
        get_active_rebalance_event: (year: number) => Array.from(rebalance_event.values())
                                .filter((event: RebalanceEvent) => is_event_active(event, year)),
        get_active_mandatory_event: (year: number) => Array.from(expense_event.values())
                                .filter((event: ExpenseEvent) => is_event_active(event, year) && event.discretionary == false),
        get_active_discretionary_event: (year: number) => Array.from(expense_event.values())
                                .filter((event: ExpenseEvent) => is_event_active(event, year) && event.discretionary == true),
        get_income_breakdown: () => income_breakdown,
        update_income_breakdown: (eventName: string, amount: number) => {
            income_breakdown[eventName] = (income_breakdown[eventName] || 0) + amount;
        },
        reset_income_breakdown: () => {
            Object.keys(income_breakdown).forEach(key => delete income_breakdown[key]);
        },
        get_expense_breakdown: () => expense_breakdown,
        update_expense_breakdown: (eventName: string, amount: number) => {
            expense_breakdown[eventName] = (expense_breakdown[eventName] || 0) + amount;
        },
        reset_expense_breakdown: () => {
            Object.keys(expense_breakdown).forEach(key => delete expense_breakdown[key]);
        },
        get_total_expenses: () => total_expenses,
        update_total_expenses: (mandatory: number, discretionary: number) => {
            total_expenses = { mandatory, discretionary };
        },
        get_last_year_tax_totals: () => last_year_tax_totals,
        update_last_year_tax_totals: (total: number) => {
            last_year_tax_totals = { total };
        },
        update_initial_amount(event: IncomeEvent | ExpenseEvent) {
            simulation_logger.debug(`Updating event ${event.name}...`);
            const initial_amount = event.initial_amount;
            simulation_logger.debug(`initial amount: ${initial_amount}`);
            const annual_change = event.expected_annual_change.sample();
            simulation_logger.debug(`annual change: ${annual_change}`);
            const change_type = event.change_type;
            simulation_logger.debug(`change type: ${change_type}`);
            let change;
            if (change_type === ChangeType.AMOUNT) {
            change = annual_change;
            } else if (change_type === ChangeType.PERCENT) {
            change = annual_change * initial_amount
            } else {
            simulation_logger.error(`event ${event.name} contain invalid change_type ${event.change_type}`)
            throw new Error(`Invalid Change type ${change_type}`);
            }
            let current_amount = Math.round(initial_amount + change);
            // update the event
            event.initial_amount = current_amount;
            simulation_logger.debug(`Updated amount: ${current_amount}`);
            return current_amount;
        },
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
        const startType = event.start.type;
        if (startType === "startWith" || startType === "startAfter") {
          const dependencyName = event.start.eventSeries;
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
                if (dependent_event.start.type === "startWith") {
                    dependent_event.start = {
                        type: "fixed",
                        value: resolved_event.start,
                    };
                } 
                // endWith
                else {
                    dependent_event.start = {
                        type: "fixed",
                        value: resolved_event.start + resolved_event.duration,
                    };
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