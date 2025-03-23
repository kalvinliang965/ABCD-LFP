
import { SimulationState, create_simulation_state } from './SimulationState';
import { SimulationResult } from './SimulationResult';
import { Scenario } from '../domain/scenario/Scenario';

export class SimulationEngine {

    public constructor(
        public current_state: SimulationState,
        private readonly scenario: Scenario
    ) {}

    public async run(num_simulations: number): Promise<SimulationResult[]> {

        const simulation_promises: Promise<SimulationResult>[] = Array.from(
            {length: num_simulations}, // length of the array
             (_, i) => {

                return new Promise<SimulationResult>(async (resolve) => {
                    const simulation_state = await create_simulation_state(this.scenario); 
                    const simulation_result = new SimulationResult();
                    // Run the simulation synchronously.
                    while (this.should_continue(simulation_state)) {
                        this.simulate_year(simulation_state, simulation_result);
                        simulation_state.advance_year();
                    }
                    resolve(simulation_result);
                });
        });

        const res = await Promise.all(simulation_promises);
        return res;
    }

    private simulate_year(simulate_state: SimulationState, simulation_reuslst: SimulationResult ) {
        simulate_state.setup_year();
    }

    private should_continue(simulation_state: SimulationState):boolean {
        return simulation_state.user.is_alive();
    }

    private generate_result(): SimulationResult {
        // TODO
        return ""
    }
}