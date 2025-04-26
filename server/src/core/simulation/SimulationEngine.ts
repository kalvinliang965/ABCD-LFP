
import { SimulationState, create_simulation_state } from './SimulationState';
import { SimulationYearlyResult, create_simulation_yearly_result } from './SimulationYearlyResult';
import { create_scenario, Scenario } from '../domain/scenario/Scenario';
import run_roth_conversion_optimizer from './logic/RothConversion';
import update_investment from './logic/UpdateInvestment';
import { create_federal_tax_service, FederalTaxService } from "../tax/FederalTaxService";
import { create_state_tax_service_yaml, create_state_tax_service_db, StateTaxService } from "../tax/StateTaxService";
import { create_scenario_raw_yaml } from '../../services/ScenarioYamlParser';
import { ScenarioRaw } from '../domain/raw/scenario_raw';
import run_income_event from './logic/RunIncomeEvent';
 
export interface SimulationEngine {
    run: (num_simulations: number) => Promise<SimulationYearlyResult[]>;
}

import { simulation_logger } from '../../utils/logger/logger';
import { process_rmd } from './logic/ProcessRMD';
import { pay_mandatory_expenses } from './logic/PayMandatoryExpense';
import { pay_discretionary_expenses } from './logic/PayDiscretionaryExpense';
import { invest_excess_cash as run_invest_event } from './logic/InvestExcessCash';
import { run_rebalance_investment } from './logic/RebalanceInvestments';
import { delete_state_tax_brackets_by_state } from '../../db/repositories/StateTaxBracketRepository';
import { get_rmd_factors_from_db, save_rmd_factors_to_db } from '../../db/repositories/RMDFactorRepository';
import { fetch_and_parse_rmd } from '../../services/RMDScraper';
import { tax_config } from '../../config/tax';
import { SimulationEnvironment } from './ LoadSimulationEnvironment';

export async function create_simulation_engine(simulation_environment: SimulationEnvironment): Promise<SimulationEngine> {

    simulation_logger.info("Initializing the simulation engine...");

    const {scenario, federal_tax_service, state_tax_service, rmd_table} = simulation_environment;
    
    // we will be using this one for now
    async function run(num_simulations: number): Promise<SimulationYearlyResult[]> {
        const res: SimulationYearlyResult[] = [];
        simulation_logger.info("Simulation started with config: ", {
            scenario: scenario,
        });
        
        let i = 0
        let simulation_state;
        let simulation_result;
        try {
            for (; i < num_simulations; i++) {
                simulation_state = await create_simulation_state(scenario, federal_tax_service, state_tax_service); 
                simulation_result = create_simulation_yearly_result();
                // Run the simulation synchronously.
                while (should_continue(simulation_state)) {
                    // adjust for tax, inflation, etc...
                    simulation_state.setup();
                    // simulate year
                    if (!simulate_year(simulation_state, simulation_result)) {
                        simulation_logger.info(`
                            User cannot pay all mandatory expense for ${simulation_state.get_current_year()}
                        `);
                    }
                    // increase uesr age and tax status
                    simulation_state.advance_year();
                }
                simulation_logger.info(
                    `${i + 1} simulation completed`,
                    {
                        simulaiton_result: simulation_result,
                    }
                )
                res.push(simulation_result);
            }
        } catch (error) {
            simulation_logger.error(
                `Error occurred running ${i}th simulation`,
                {
                    simulation_state: simulation_state,
                    simulation_result: simulation_result,
                    error: error instanceof Error? error.stack: error
                }
            )
        }
        simulation_logger.info("Successfully running all simulation")
        return res;
    }



    function simulate_year(simulation_state: SimulationState, simulation_result: SimulationYearlyResult ): boolean {
        try {
            simulation_logger.debug(
                "Simulating new year", 
                {
                    simulation_state: simulation_state,
                }
            ); 
            simulation_logger.debug("Running income events")
            run_income_event(simulation_state);
            
            if (simulation_state.user.get_age() >= 74) {
                simulation_logger.debug("Performing rmd...");
                process_rmd(simulation_state, rmd_table);
            }
            simulation_logger.debug("Updating investments...");
            update_investment(simulation_state);
            if (simulation_state.roth_conversion_opt) {
                simulation_logger.debug("Running roth conversion optimizer...");
                run_roth_conversion_optimizer(simulation_state);
            }
            
            simulation_logger.debug(`Paying non discretionary expenses...`);
            if (!pay_mandatory_expenses(simulation_state)) {
                simulation_logger.info(`User cannnot pay all non discretionary expenses`);
                return false;
            }
            
            simulation_logger.debug(`Paying discretionary expenses`);
            pay_discretionary_expenses(simulation_state);

            simulation_logger.debug(`Running invest event scheduled for current year...`);
            run_invest_event(simulation_state);

            simulation_logger.debug(`Running rebalance events scheduled for the current year...`);
            run_rebalance_investment(simulation_state);

            simulation_result.update(simulation_state);
            return true;
        } catch (error) {
            throw error
        }
    }

    function should_continue(simulation_state: SimulationState):boolean {
        return simulation_state.user.is_alive();
    }

    return {
        run,
    }

}



    // async function run(num_simulations: number): Promise<SimulationResult[]> {
    //     const simulation_promises: Promise<SimulationResult>[] = Array.from(
    //         {length: num_simulations}, // length of the array
    //          (_, i) => {

    //             return new Promise<SimulationResult>(async (resolve) => {
    //                 const simulation_state = await create_simulation_state(scenario, federal_tax_service, state_tax_service); 
    //                 const simulation_result = create_simulation_result();
    //                 // Run the simulation synchronously.
    //                 while (should_continue(simulation_state)) {
    //                     simulate_year(simulation_state, simulation_result);
    //                     simulation_state.advance_year();
    //                 }
    //                 resolve(simulation_result);
    //             });
    //     });

    //     const res = await Promise.all(simulation_promises);
    //     return res;

    // }