import { IncomeEventRaw, ExpenseEventRaw, InvestEventRaw, RebalanceEventRaw, EventUnionRaw, create_income_event_raw, create_invest_event_raw } from "./raw/event_raw/event_raw";
import create_income_event, { IncomeEvent } from "./event/IncomeEvent";
import create_expense_event, { ExpenseEvent } from "./event/ExpenseEvent";
import create_invest_event from "./event/InvestEvent";
import create_rebalance_event, { RebalanceEvent } from "./event/RebalanceEvent";
import { InvestEvent } from "./event/InvestEvent";
import { simulation_logger } from "../../utils/logger/logger";
import { clone_map } from "../../utils/helper";
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

function parse_events(
  eventSeries: Set<EventUnionRaw>
): [IncomeEventMap, ExpenseEventMap, InvestEventMap, RebalanceEventMap] {
    const income_event_map = new Map<string, IncomeEvent>();
    const expense_event_map = new Map<string, ExpenseEvent>();
    const invest_event_map = new Map<string, InvestEvent>();
    const rebalance_event_map = new Map<string, RebalanceEvent>();
    for (const event of eventSeries) {
        switch (event.type) {
            case "income":
                income_event_map.set(event.name, create_income_event(event as IncomeEventRaw));
                break;
            case "expense":
                expense_event_map.set(event.name, create_expense_event(event as ExpenseEventRaw));
                break;
            case "invest":
                invest_event_map.set(event.name, create_invest_event(event as InvestEventRaw));
                break;
            case "rebalance":
                rebalance_event_map.set(event.name, create_rebalance_event(event as RebalanceEventRaw));
                break;
            default:
                throw new Error(`Unknown event type: ${event.type}`);
        }
    }
    return [income_event_map, expense_event_map, invest_event_map, rebalance_event_map];
}

export interface EventManager {
    print: () => void;
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
        print: () => console.log("Hello"),
        clone: () => create_event_manager_clone(
            clone_map(income_event),
            clone_map(expense_event),
            clone_map(invest_event),
            clone_map(rebalance_event),
        )
    }
}
export function create_event_manager(event_series: Set<EventUnionRaw>): EventManager {
    try {
        // Sanity Check
        if (detect_event_cycle(event_series)) {
            simulation_logger.error(
                "Detected cycle inside event series.",
                {
                    event_series: event_series,
                }
            )
            throw new Error("Failed to create event manager. Cycle detected");
        }    
        const [income_event, expense_event, invest_event, rebalance_event] = parse_events(event_series);
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


// DSU algo
export function detect_event_cycle(event_series: Set<EventUnionRaw>): boolean {
    const mp = new Map<string, EventUnionRaw>();
    const Parent = new Map<string, string>();
    const Size = new Map<string, number>();

    // init 
    for (const event of event_series) {
        Parent.set(event.name, event.name);
        Size.set(event.name, 1);
        mp.set(event.name, event);
    }    
    
    function find_root(node: string) {
        const root = Parent.get(node);
        if (!root) {
            console.error(`detect_event_cycle: ndoe ${node} root doesnt exist`);
            process.exit(1);
        }
        // compression
        while (Parent.get(node) != root ) {
            const nxt = Parent.get(node);
            if (!nxt) {
                console.error(`detect_event_cycle: ndoe ${nxt} root doesnt exist`);
                process.exit(1);
            }
            Parent.set(node, root);
            node = nxt;
        }
        return root;
    }
    function unify(p: EventUnionRaw, q: EventUnionRaw): boolean {        
        let [pr, qr] = [find_root(p.name), find_root(q.name)];
        if (pr == qr) {
            return false
        }
        const [pr_size, qr_size] = [Size.get(pr), Size.get(qr)];
        if (pr_size == undefined || qr_size == undefined) {
            console.error("Node size not defined");
            process.exit(1);
        }
        if (pr_size < qr_size) {
            [pr, qr] = [qr, pr];
        }
        Parent.set(qr, pr);
        Size.set(pr, pr_size + qr_size);
        return true;
    }
    for (const event of event_series) {
        const start_type = event.start.get("type");
        if (!start_type) {
            console.error("Event dont have start type");
            process.exit(1);
        }
        if (start_type === "startWith" || start_type === "endWith") {
            const to_event_name = event.start.get("eventSeries");
            if (!to_event_name) {
                throw new Error(`Missing eventSeries in ${event.name}`);
            }
            const to_event = mp.get(to_event_name);
            if (!to_event) {
                throw new Error(`Target event ${to_event_name} not found`);
            }
            if (!unify(event, to_event)) {
                return true;
            }
        }
    }
    return false;
}

// export function sort_expenses_by_strategy(
//     expenses: SpendingEvent[],
//     strategy: string[]
//   ): SpendingEvent[] {
//     const priorityMap = new Map<string, number>();
  
//     strategy.forEach((name, index) => {
//       priorityMap.set(name, index);
//     });
  
//     return [...expenses].sort((a, b) => {
//       const priorityA = priorityMap.has(a.name)
//         ? priorityMap.get(a.name)!
//         : Number.MAX_SAFE_INTEGER;
//       const priorityB = priorityMap.has(b.name)
//         ? priorityMap.get(b.name)!
//         : Number.MAX_SAFE_INTEGER;
//       return priorityA - priorityB;
//     });
//   }
  
//   function get_sorted_discretionary_expenses(
//     events: Event[],
//     strategy: string[]
//   ): SpendingEvent[] {
  
//     const unsorted_discretionary_expenses = get_discretionary_expenses(events);
//     return sort_expenses_by_strategy(unsorted_discretionary_expenses, strategy);
//   }