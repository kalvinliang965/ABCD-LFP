
import { SimulationState, create_simulation_state } from './SimulationState';
import { SimulationResult, create_simulation_result } from './SimulationResult';
import { create_scenario, Scenario } from '../domain/scenario/Scenario';
import process_roth_conversion from './logic/RothConversion';
import update_investment from './logic/UpdateInvestment';
import { create_federal_tax_service, FederalTaxService } from "../tax/FederalTaxService";
import { create_state_tax_service_yaml, create_state_tax_service_db, StateTaxService } from "../tax/StateTaxService";
import { create_scenario_raw_yaml } from '../../services/ScenarioYamlParser';
import { ScenarioRaw } from '../domain/raw/scenario_raw';

export interface SimulationEngine {
    run: (num_simulations: number) => Promise<SimulationResult[]>;
}

export async function create_simulation_engine(scenario_yaml: string, state_yaml: string): Promise<SimulationEngine> {

    let scenario: Scenario, federal_tax_service: FederalTaxService, state_tax_service: StateTaxService;
    // Create tax services
    try {
        // initialize scenario object
        const scenario_raw: ScenarioRaw = create_scenario_raw_yaml(scenario_yaml);
        scenario = await create_scenario(scenario_raw);
        
        // initialize federal tax service
        federal_tax_service = await create_federal_tax_service();
        
        // initialize state tax service 
        if (state_yaml) {
            state_tax_service = await create_state_tax_service_yaml(scenario.residence_state, state_yaml);
        } else {
            state_tax_service = await create_state_tax_service_db(scenario.residence_state); 
        }
    } catch (error) {
        console.error(`Failed to setup the simulation engine: ${error instanceof Error? error.message: error}`);
        process.exit(1);
    }
    
    async function run(num_simulations: number): Promise<SimulationResult[]> {
        const simulation_promises: Promise<SimulationResult>[] = Array.from(
            {length: num_simulations}, // length of the array
             (_, i) => {

                return new Promise<SimulationResult>(async (resolve) => {
                    const simulation_state = await create_simulation_state(scenario, federal_tax_service, state_tax_service); 
                    const simulation_result = create_simulation_result();
                    // Run the simulation synchronously.
                    while (should_continue(simulation_state)) {
                        simulate_year(simulation_state, simulation_result);
                        simulation_state.advance_year();
                    }
                    resolve(simulation_result);
                });
        });

        const res = await Promise.all(simulation_promises);
        return res;
    }

    function simulate_year(simulation_state: SimulationState, simulation_result: SimulationResult ) {
        if (simulation_state.roth_conversion_opt) {
            process_roth_conversion(simulation_state);
        }
        update_investment(simulation_state);
        simulation_result.update(simulation_state);
    }

    function should_continue(simulation_state: SimulationState):boolean {
        return simulation_state.user.is_alive();
    }

    return {
        run,
    }

}