
import { SimulationState, create_simulation_state } from './SimulationState';
import { SimulationResult } from './SimulationResult';
import { Scenario } from '../domain/scenario/Scenario';
import process_roth_conversion from './RothConversion';
import update_investment from './UpdateInvestment';

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

    private simulate_year(simulation_state: SimulationState, simulation_result: SimulationResult ) {
        simulation_state.setup_year();

        if (simulation_state.roth_conversion_opt) {
            process_roth_conversion(simulation_state);
        }

        
    }

    private should_continue(simulation_state: SimulationState):boolean {
        return simulation_state.user.is_alive();
    }

    private generate_result(): SimulationResult {
        // TODO
        return ""
    }
}