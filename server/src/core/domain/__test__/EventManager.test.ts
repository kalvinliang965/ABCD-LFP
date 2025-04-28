jest.mock('@stdlib/random-base-normal', () => {
  return jest.fn((mean: number, sd: number) => mean);
});

import { create_expense_event_raw, streaming_services_expense_one } from "../raw/event_raw/expense_event_raw";
import { create_event_manager, resolve_event_chain } from "../EventManager";
import { EventUnionRaw, salary_income_event_one } from "../raw/event_raw/event_raw";
import { resolve } from "path";
import { EventUnion } from "../event/Event";
import { create_invest_event_raw } from "../raw/event_raw/investment_event_raw";
import { create_rebalance_event_raw } from "../raw/event_raw/rebalance_event_raw";


const create_cycle_event = (
    name: string, 
    dependency_type: "startWith" | "startAfter" | "none",
    target_event?:string
): EventUnionRaw =>  {

    if (dependency_type === "none") {
        return create_expense_event_raw(
            name,
            { 
                type: "fixed",
                value: 2025,
            },
            {
                type: "fixed",
                value: 40,
            },
            500,
            "amount",
            {
                type: "fixed",
                value: 0,
            },
            true,
            1.0,
            true,
        )
    } else {
        return create_expense_event_raw(
            name,
            {
                type: dependency_type,
                eventSeries: target_event,
            },
            {
                type: "fixed",
                value: 40,
            },
            500,
            "amount",
            {
                type: "fixed",
                value: 0,
            },
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
            create_cycle_event("C", "startAfter", "B1"),
          ]);
          const result = resolve_event_chain(events);
          expect(result.map(e => e.name)).toEqual([
            'A', 
            'B1', 'B2', 
            'C'
          ]);
        });
      });

    describe("InvestEvent overlap pruning", () => {
        //helper function to create a raw invest event with fixed start and duration
        function make_invest_raw(
            name: string,
            start: number,
            duration: number
        ) {
            return create_invest_event_raw(
                name,
                { type: 'fixed', value: start },
                { type: 'fixed', value: duration },
                { 'S&P 500 non-retirement': 1.0 },  //filling out, does not matter really
                false,
                { 'S&P 500 non-retirement': 1.0 },  
                10000 // max cash
            );
        }

        it('keeps only the earliest-start event when two overlap', () => {
            const raw1 = make_invest_raw('E1', 2025, 10); //covers 2025–2035
            const raw2 = make_invest_raw('E2', 2027, 1);  //covers 2027–2028, overlaps E1
        
            //resolve and build the manager
            const manager = create_event_manager(new Set([raw1, raw2]));
        
            //E1 should be the only active event in 2027:
            const active_2027 = manager.get_active_invest_event(2027);
            expect(active_2027).toHaveLength(1);
            expect(active_2027[0].name).toBe('E1');
        
            //outside overlap, each shows up
            const active_2026 = manager.get_active_invest_event(2026);
            expect(active_2026.map(e => e.name)).toEqual(['E1']);
            const active_2032 = manager.get_active_invest_event(2032);
            //E1 still covers, E2 does not
            expect(active_2032.map(e => e.name)).toEqual(['E1']);
        });
        
        it('keeps both when they do not overlap', () => {
            const raw1 = make_invest_raw('E1', 2025, 2); //2025–2027
            const raw2 = make_invest_raw('E2', 2028, 2); //2028–2030
        
            const manager = create_event_manager(new Set([raw1, raw2]));
        
            expect(manager.get_active_invest_event(2026).map(e => e.name)).toEqual(['E1']);
            expect(manager.get_active_invest_event(2028).map(e => e.name)).toEqual(['E2']);
        });

        //tests with distributions 
        describe('with "random" distributions', () => {
            function make_raw_with_dist(
                name: string,
                start_dist: any,
                dur_dist: any
            ) {
                return create_invest_event_raw(
                    name,
                    start_dist,
                    dur_dist,
                    { 'S&P 500 non-retirement': 1.0 },
                    false,
                    { 'S&P 500 non-retirement': 1.0 },
                    10000
                );
            }
            
            it('prunes two uniform-distribution events that deterministically overlap', () => {
                //E1: starts 2025 for 10 years which covers 2025–2035
                const raw1 = make_raw_with_dist('E1',
                    { type: 'uniform', lower: 2025, upper: 2025 },
                    { type: 'uniform', lower: 10, upper: 10 }
                );
            
                //E2: starts 2027 for 1 year which covers 2027–2028
                const raw2 = make_raw_with_dist('E2',
                    { type: 'uniform', lower: 2027, upper: 2027 },
                    { type: 'uniform', lower: 1, upper: 1 }
                );
            
                const mgr = create_event_manager(new Set([raw1, raw2]));
            
                //2027 is in both windows, but we should only see E1:
                const act = mgr.get_active_invest_event(2027);
                expect(act.map(e => e.name)).toEqual(['E1']);
            });
            //using mocked normal distribution, 
            //because it is impossible to get normal distribution to return deterministic values
            it('prunes overlapping normal-dist invest events with mocked normal distribution', () => {
                //E1: start normal(2030,0) for normal(5,0) which covers 2030–2035
                const raw1 = make_raw_with_dist('E1',
                    { type: 'normal', mean: 2030, stdev: 0 },
                    { type: 'normal', mean: 5, stdev: 0 }
                );
            
                //E2: start normal(2032,0) for normal(1,0) which covers 2032–2033
                const raw2 = make_raw_with_dist('E2',
                    { type: 'normal', mean: 2032, stdev: 0 },
                    { type: 'normal', mean: 1, stdev: 0 }
                );
            
                const mgr = create_event_manager(new Set([raw1, raw2]));
            
                //2032 is in both, but only E1 is kept
                expect(mgr.get_active_invest_event(2032)[0].name).toBe('E1');
            });
        });
    });

    describe("RebalanceEvent overlap pruning", () => {
        //helper function to create a raw rebalance event with fixed start and duration
        function make_rebalance_raw(
            name: string,
            start: number,
            duration: number,
            allocation: { [key: string]: number } = { 'S&P 500 non-retirement': 1.0 }
        ) {
            return create_rebalance_event_raw(
                name,
                { type: 'fixed', value: start },
                { type: 'fixed', value: duration },
                allocation
            );
        }

        //helper function to create a raw rebalance event with distribution-based start/duration
        function make_rebalance_with_dist(
            name: string,
            start_dist: any,
            dur_dist: any,
            allocation: { [key: string]: number } = { 'S&P 500 non-retirement': 1.0 }
        ) {
            return create_rebalance_event_raw(
                name,
                start_dist,
                dur_dist,
                allocation
            );
        }

        it('keeps only the earliest-start event when two overlap for same account', () => {
            const raw1 = make_rebalance_raw('R1', 2025, 10); //covers 2025–2035
            const raw2 = make_rebalance_raw('R2', 2027, 1);  //covers 2027–2028, overlaps R1
        
            //resolve and build the manager
            const manager = create_event_manager(new Set([raw1, raw2]));
        
            //R1 should be the only active event in 2027:
            const active_2027 = manager.get_active_rebalance_event(2027);
            expect(active_2027).toHaveLength(1);
            expect(active_2027[0].name).toBe('R1');
        
            //outside overlap, each shows up
            const active_2026 = manager.get_active_rebalance_event(2026);
            expect(active_2026.map(e => e.name)).toEqual(['R1']);
            const active_2032 = manager.get_active_rebalance_event(2032);
            //R1 still covers, R2 does not
            expect(active_2032.map(e => e.name)).toEqual(['R1']);
        });
        
        it('keeps both when they do not overlap for same account', () => {
            const raw1 = make_rebalance_raw('R1', 2025, 2); //2025–2027
            const raw2 = make_rebalance_raw('R2', 2028, 2); //2028–2030
        
            const manager = create_event_manager(new Set([raw1, raw2]));
        
            expect(manager.get_active_rebalance_event(2026).map(e => e.name)).toEqual(['R1']);
            expect(manager.get_active_rebalance_event(2028).map(e => e.name)).toEqual(['R2']);
        });

        it('allows overlapping events for different accounts', () => {
            const raw1 = create_rebalance_event_raw(
                'R1',
                { type: 'fixed', value: 2025 },
                { type: 'fixed', value: 10 },
                { 'S&P 500 non-retirement': 1.0 }
            );
            const raw2 = create_rebalance_event_raw(
                'R2',
                { type: 'fixed', value: 2027 },
                { type: 'fixed', value: 1 },
                { 'S&P 500 after-tax': 1.0 }  //different account
            );
        
            const manager = create_event_manager(new Set([raw1, raw2]));
        
            //both events should be active in 2027 since they're for different accounts
            const active_2027 = manager.get_active_rebalance_event(2027);
            expect(active_2027.map(e => e.name).sort()).toEqual(['R1', 'R2'].sort());
        });

        it('handles multi-asset rebalance events correctly', () => {
            const raw1 = make_rebalance_raw(
                'R1',
                2025,
                10,
                {
                    'US Stocks non-retirement': 0.6,
                    'International Stocks non-retirement': 0.4
                }
            );
            const raw2 = make_rebalance_raw(
                'R2',
                2027,
                1,
                {
                    'US Stocks non-retirement': 0.7,
                    'International Stocks non-retirement': 0.3
                }
            );
        
            const manager = create_event_manager(new Set([raw1, raw2]));
        
            //R1 should be the only active event in 2027 since it's for the same account type
            const active_2027 = manager.get_active_rebalance_event(2027);
            expect(active_2027).toHaveLength(1);
            expect(active_2027[0].name).toBe('R1');
        });

        it('handles multi-asset rebalance events with different account types', () => {
            const raw1 = make_rebalance_raw(
                'R1',
                2025,
                10,
                {
                    'US Stocks non-retirement': 0.6,
                    'International Stocks non-retirement': 0.4
                }
            );
            const raw2 = make_rebalance_raw(
                'R2',
                2027,
                1,
                {
                    'US Stocks pre-tax': 0.7,
                    'International Stocks pre-tax': 0.3
                }
            );
        
            const manager = create_event_manager(new Set([raw1, raw2]));
        
            //both events should be active in 2027 since they're for different account types
            const active_2027 = manager.get_active_rebalance_event(2027);
            expect(active_2027.map(e => e.name).sort()).toEqual(['R1', 'R2'].sort());
        });

        describe('with "random" distributions', () => {
            it('prunes overlapping uniform-dist rebalance events', () => {
                const raw1 = make_rebalance_with_dist(
                    'R1',
                    { type: 'uniform', lower: 2025, upper: 2025 },
                    { type: 'uniform', lower: 10, upper: 10 },
                    {
                        'US Stocks non-retirement': 0.6,
                        'International Stocks non-retirement': 0.4
                    }
                );
                const raw2 = make_rebalance_with_dist(
                    'R2',
                    { type: 'uniform', lower: 2027, upper: 2027 },
                    { type: 'uniform', lower: 1, upper: 1 },
                    {
                        'US Stocks non-retirement': 0.7,
                        'International Stocks non-retirement': 0.3
                    }
                );
            
                const manager = create_event_manager(new Set([raw1, raw2]));
            
                //R1 should be the only active event in 2027
                const active_2027 = manager.get_active_rebalance_event(2027);
                expect(active_2027).toHaveLength(1);
                expect(active_2027[0].name).toBe('R1');
            });

            it('prunes overlapping normal-dist rebalance events with mocked normal distribution', () => {
                const raw1 = make_rebalance_with_dist(
                    'R1',
                    { type: 'normal', mean: 2030, stdev: 0 },
                    { type: 'normal', mean: 5, stdev: 0 },
                    {
                        'US Stocks non-retirement': 0.6,
                        'International Stocks non-retirement': 0.4
                    }
                );
                const raw2 = make_rebalance_with_dist(
                    'R2',
                    { type: 'normal', mean: 2032, stdev: 0 },
                    { type: 'normal', mean: 1, stdev: 0 },
                    {
                        'US Stocks non-retirement': 0.7,
                        'International Stocks non-retirement': 0.3
                    }
                );
            
                const manager = create_event_manager(new Set([raw1, raw2]));
            
                //R1 should be the only active event in 2032
                const active_2032 = manager.get_active_rebalance_event(2032);
                expect(active_2032).toHaveLength(1);
                expect(active_2032[0].name).toBe('R1');
            });
        });
    });
});