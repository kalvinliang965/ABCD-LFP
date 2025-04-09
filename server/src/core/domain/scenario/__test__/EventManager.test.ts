import { create_expense_event_raw } from "../../raw/event_raw/expense_event_raw";
import { detect_event_cycle } from "../../EventManager";
import { EventUnionRaw } from "../../raw/event_raw/event_raw";


const createMockEvent = (
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

    describe("cycle", () => {
        it("should detect cycle", () => {
            const events = new Set<EventUnionRaw>([
                createMockEvent("A", "startWith", "B"),
                createMockEvent("B", "startWith", "A"),
            ])
            expect(detect_event_cycle(events)).toBe(true)
        });

        it('should detect indirect cycle', () => {
            const events = new Set<EventUnionRaw>([
            createMockEvent('A', 'startWith', 'B'),
            createMockEvent('B', 'startWith', 'C'),
            createMockEvent('C', 'startWith', 'A')
            ]);
            expect(detect_event_cycle(events)).toBe(true);
        });
        
        it('should return false for no cycle', () => {
            const events = new Set<EventUnionRaw>([
                createMockEvent('A', 'startWith', 'B'),
                createMockEvent('B', 'none'),
                createMockEvent('C', 'endWith', 'B')
            ]);
            expect(detect_event_cycle(events)).toBe(false);
        });

        it('should handle single node', () => {
            const events = new Set<EventUnionRaw>([
                createMockEvent('A', 'none')
            ]);
            expect(detect_event_cycle(events)).toBe(false);
        });
        
        it('should throw on invalid dependency', () => {
            const events = new Set<EventUnionRaw>([
            createMockEvent('A', 'startWith', 'B'),
            createMockEvent('C', 'none')
            ]);
            expect(() => detect_event_cycle(events)).toThrow('Target event B not found');
        });
        
        it('should handle complex non-cyclic graph', () => {
            const events = new Set<EventUnionRaw>([
                createMockEvent('A', 'startWith', 'B'),
                createMockEvent('B', 'startWith', 'C'),
                createMockEvent('C', 'endWith', 'D'),
                createMockEvent('D', 'none'),
                createMockEvent('E', 'endWith', 'D')
            ]);
            expect(detect_event_cycle(events)).toBe(false);
        });
    })

});