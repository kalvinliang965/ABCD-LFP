
import { SimulationState, create_simulation_state } from './SimulationState';
import { SimulationResult, create_simulation_result } from './SimulationResult';
import { Scenario } from '../domain/scenario/Scenario';
import process_roth_conversion from './logic/RothConversion';
import update_investment from './logic/UpdateInvestment';

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
                    const simulation_result = create_simulation_result();
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
        if (simulation_state.roth_conversion_opt) {
            process_roth_conversion(simulation_state);
        }
        update_investment(simulation_state);
        simulation_result.update(simulation_state);
    }

    private should_continue(simulation_state: SimulationState):boolean {
        return simulation_state.user.is_alive();
    }

}