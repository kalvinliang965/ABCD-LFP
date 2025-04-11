import { create_expense_event_raw, streaming_services_expense_one } from "../raw/event_raw/expense_event_raw";
import { create_event_manager, resolve_event_chain } from "../EventManager";
import { EventUnionRaw, salary_income_one } from "../raw/event_raw/event_raw";
import { resolve } from "path";
import { EventUnion } from "../event/Event";


const create_cycle_event = (
    name: string, 
    dependency_type: "startWith" | "endWith" | "none",
    target_event?:string
): EventUnionRaw =>  {

    if (dependency_type === "none") {
        return create_expense_event_raw(
            name,
            new Map<string, any>([
                ["type", "fixed"],
                ["value", 2025],
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
        )
    } else {
        return create_expense_event_raw(
            name,
            new Map<string, any>([
                ["type", dependency_type],
                ["eventSeries", target_event],
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
        )
    }
}
describe("EventManager", () => {

    describe("clone", () => {
        it('should create independent copy', () => {
            const events = new Set<EventUnionRaw>([
                create_cycle_event("A", "none"),
                create_cycle_event("B1", "startWith", "A"),
                create_cycle_event("B2", "startWith", "A"),
                create_cycle_event("C", "startWith", "B1"),
            ]);
            const result = resolve_event_chain(events);
            result.forEach((event: EventUnion) => {
                expect(event.start).toBe(2025)
            })
        });
        
    });

    describe("resolve event", () => {
        it("should detect direct cycle", () => {
          const events = new Set<EventUnionRaw>([
            create_cycle_event("A", "startWith", "B"),
            create_cycle_event("B", "startWith", "A")
          ]);
          expect(() => resolve_event_chain(events)).toThrow(/Unresolvable event chain/);
        });
    })
    describe("cycle detection", () => {
        // invalid chain A <-> B
        it("should detect direct cycle", () => {
          const events = new Set<EventUnionRaw>([
            create_cycle_event("A", "startWith", "B"),
            create_cycle_event("B", "startWith", "A")
          ]);
          expect(() => resolve_event_chain(events)).toThrow(/Unresolvable event chain/);
        });
    
        // invalid chain: A -> B -> C -> A
        it("should detect indirect cycle", () => {
          const events = new Set<EventUnionRaw>([
            create_cycle_event("A", "startWith", "B"),
            create_cycle_event("B", "startWith", "C"),
            create_cycle_event("C", "startWith", "A")
          ]);
          expect(() => resolve_event_chain(events)).toThrow(/Unresolvable event chain/);
        });
    
        // vaild chain：A -> B -> C
        it("should resolve linear dependency", () => {
          const events = new Set<EventUnionRaw>([
            create_cycle_event("A", "startWith", "B"),
            create_cycle_event("B", "startWith", "C"),
            create_cycle_event("C", "none")
          ]);
          const result = resolve_event_chain(events);
          expect(result.map(e => e.name)).toEqual(['C', 'B', 'A']);
        });
    
        it("should handle single node", () => {
          const events = new Set<EventUnionRaw>([
            create_cycle_event("A", "none")
          ]);
          const result = resolve_event_chain(events);
          expect(result.map(e => e.name)).toEqual(['A']);
        });
    
        it("should throw on invalid dependency", () => {
          const events = new Set<EventUnionRaw>([
            create_cycle_event("A", "startWith", "GHOST_EVENT")
          ]);
          expect(() => resolve_event_chain(events)).toThrow(/Unresolvable event chain/);
        });
    
        it("should resolve correct", () => {
          const events = new Set<EventUnionRaw>([
            create_cycle_event("A", "none"),
            create_cycle_event("B1", "startWith", "A"),
            create_cycle_event("B2", "startWith", "A"),
            create_cycle_event("C", "endWith", "B1"),
          ]);
          const result = resolve_event_chain(events);
          expect(result.map(e => e.name)).toEqual([
            'A', 
            'B1', 'B2', 
            'C'
          ]);
        });
      });

});