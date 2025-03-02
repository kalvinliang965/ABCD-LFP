
import { SimulationState } from './SimulationState';
import { SimulationResult } from './SimulationResult';
import  { Scenario } from "./Scenario";

export class SimulationEngine {

    public constructor(
        public current_state: SimulationState,
        private readonly scenario: Scenario
    ) {}

    public async run(num_simulations: number): Promise<SimulationResult[]> {

        const simulation_promises: Promise<SimulationResult>[] = Array.from(
            {length: num_simulations}, // length of the array
             (_, i) => {

                return new Promise<SimulationResult>((resolve) => {
                    const simulation_state = new SimulationState(this.scenario); 
                    const simulation_result = new SimulationResult();

                    // Run the simulation synchronously.
                    while (this.should_continue(simulation_state)) {
                        this.simulate_year(simulation_state, simulation_result, this.scenario);
                    }
                    resolve(simulation_result);
                });
        });

        const res = await Promise.all(simulation_promises);
        return res;
    }

    private simulate_year(simulate_state: SimulationState, simulation_reuslst: SimulationResult, scenario: Scenario) {
        // TODO
    }

    private should_continue(simulation_state: SimulationState):boolean {
        return simulation_state.get_spouse_alive() || simulation_state.get_spouse_alive();
    }

    private generate_result(): SimulationResult {
        // TODO
        return ""
    }
}