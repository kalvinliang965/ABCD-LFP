import { create_expense_event_raw, streaming_services_expense_one } from "../../raw/event_raw/expense_event_raw";
import { create_event_manager, detect_event_cycle } from "../../EventManager";
import { EventUnionRaw, salary_income_one } from "../../raw/event_raw/event_raw";


const create_mock_event = (
    name: string, 
    dependency_type: "startWith" | "endWith" | "none",
    target_event?:string
): EventUnionRaw =>  {
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
describe("EventManager", () => {

    describe("clone", () => {
        it('should create independent copy', () => {
            const events = new Set<EventUnionRaw>([
                salary_income_one,
            ])
            const original = create_event_manager(events);
            const cloned = original.clone();
            cloned._income_event.clear();
            expect(original._income_event.size).not.toBe(0);
        });
        
    });

    describe("cycle", () => {
        it("should detect cycle", () => {
            const events = new Set<EventUnionRaw>([
                create_mock_event("A", "startWith", "B"),
                create_mock_event("B", "startWith", "A"),
            ])
            expect(detect_event_cycle(events)).toBe(true)
        });

        it('should detect indirect cycle', () => {
            const events = new Set<EventUnionRaw>([
            create_mock_event('A', 'startWith', 'B'),
            create_mock_event('B', 'startWith', 'C'),
            create_mock_event('C', 'startWith', 'A')
            ]);
            expect(detect_event_cycle(events)).toBe(true);
        });
        
        it('should return false for no cycle', () => {
            const events = new Set<EventUnionRaw>([
                create_mock_event('A', 'startWith', 'B'),
                create_mock_event('B', 'none'),
                create_mock_event('C', 'endWith', 'B')
            ]);
            expect(detect_event_cycle(events)).toBe(false);
        });

        it('should handle single node', () => {
            const events = new Set<EventUnionRaw>([
                create_mock_event('A', 'none')
            ]);
            expect(detect_event_cycle(events)).toBe(false);
        });
        
        it('should throw on invalid dependency', () => {
            const events = new Set<EventUnionRaw>([
            create_mock_event('A', 'startWith', 'B'),
            create_mock_event('C', 'none')
            ]);
            expect(() => detect_event_cycle(events)).toThrow('Target event B not found');
        });
        
        it('should handle complex non-cyclic graph', () => {
            const events = new Set<EventUnionRaw>([
                create_mock_event('A', 'startWith', 'B'),
                create_mock_event('B', 'startWith', 'C'),
                create_mock_event('C', 'endWith', 'D'),
                create_mock_event('D', 'none'),
                create_mock_event('E', 'endWith', 'D')
            ]);
            expect(detect_event_cycle(events)).toBe(false);
        });
    })

});