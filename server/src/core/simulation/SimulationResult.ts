import { SimulationState } from "./SimulationState"

export interface SimulationResult {
    update(simulation_state: SimulationState): void,
    success_probability(): number,
} 

export function create_simulation_result(): SimulationResult {
    let success = 0

    
    return {
        update: (simulation_state: SimulationState) => {
            // TODO

            // check for financial goal and increment `success`
        },

        success_probability: () => {
            // TODO
            
            return 0;
        }
    }
}