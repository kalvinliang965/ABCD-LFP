
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

import { simulation_logger } from '../../utils/logger/logger';

export async function create_simulation_engine(scenario_yaml: string, state_yaml: string): Promise<SimulationEngine> {

    simulation_logger.info("Initializing the simulation engine...");

    let scenario: Scenario, federal_tax_service: FederalTaxService, state_tax_service: StateTaxService;
    // Create tax services
    try {
        // initialize scenario object
        simulation_logger.info("parsing scenario_yaml file...");
        const scenario_raw: ScenarioRaw = create_scenario_raw_yaml(scenario_yaml);
        
        simulation_logger.info("initializing scenario object...")
        scenario = await create_scenario(scenario_raw);

        // initialize federal tax service
        simulation_logger.info("initializing federal tax service...");
        federal_tax_service = await create_federal_tax_service();
        
        
        // TODO: fix this later. if yaml file is given we assume user 
        // want to update the tax info for that state
        
        // initialize state tax service 
        if (state_yaml) {
            simulation_logger.info("initializing state tax service from yaml....");
            state_tax_service = await create_state_tax_service_yaml(scenario.residence_state, state_yaml);
        } else {
            simulation_logger.info("initializing state tax service from db....");
            state_tax_service = await create_state_tax_service_db(scenario.residence_state); 
        }
        
        simulation_logger.info("simulation engine initialized successfully");
    } catch (error) {
        console.error(`Failed to setup the simulation engine: ${error instanceof Error? error.message: error}`);
        process.exit(1);
    }
    
    // we will be using this one for now
    async function run_demo(num_simulations: number): Promise<SimulationResult[]> {
        const res: SimulationResult[] = [];
        for (let i = 0; i < num_simulations; i++) {
            const simulation_state = await create_simulation_state(scenario, federal_tax_service, state_tax_service); 
            const simulation_result = create_simulation_result();
            // Run the simulation synchronously.
            while (should_continue(simulation_state)) {
                simulate_year(simulation_state, simulation_result);
                simulation_state.advance_year();
            }
            res.push(simulation_result);
        }
        return res;
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
        run: run_demo,
    }

}