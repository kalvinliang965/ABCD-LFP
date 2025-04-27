import { SimulationState, create_simulation_state } from './SimulationState';
import { SimulationYearlyResult, create_simulation_yearly_result } from './SimulationYearlyResult';
import run_roth_conversion_optimizer from './logic/RothConversion';
import update_investment from './logic/UpdateInvestment';
import run_income_event from './logic/RunIncomeEvent';
 
import { simulation_logger } from '../../utils/logger/logger';
import { process_rmd } from './logic/ProcessRMD';
import { pay_mandatory_expenses } from './logic/PayMandatoryExpense';
import { pay_discretionary_expenses } from './logic/PayDiscretionaryExpense';
import { invest_excess_cash as run_invest_event } from './logic/InvestExcessCash';
import { run_rebalance_investment } from './logic/RebalanceInvestments';
import { SimulationEnvironment } from './ LoadSimulationEnvironment';
import { dev } from '../../config/environment';
import { Profiler } from '../../utils/Profiler';

export interface SimulationEngine {
    run: (num_simulations: number) => Promise<SimulationYearlyResult[]>;
}

export async function create_simulation_engine(simulation_environment: SimulationEnvironment): Promise<SimulationEngine> {

    simulation_logger.info("Initializing the simulation engine...");

    const profiler = new Profiler();

    const {scenario, federal_tax_service, state_tax_service, rmd_table} = simulation_environment;
    
    async function run_parallel() {
        // TODO
    }

    // not optimize
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
                    if(dev.is_dev) {
                        profiler.start("simulate_year");
                    }
                    if (!simulate_year(simulation_state, simulation_result)) {
                        simulation_logger.info(`
                            User cannot pay all mandatory expense for ${simulation_state.get_current_year()}
                        `);
                    }
                    if(dev.is_dev) {
                        profiler.end("simulate_year");
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

        if (dev.is_dev) {
            profiler.export_to_CSV();
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

            simulation_logger.debug("Running income events");
            if (dev.is_dev) {
                profiler.start("run_income_event");
            }
            run_income_event(simulation_state);
            if (dev.is_dev) {
                profiler.end("run_income_event");
            }
            
            if (simulation_state.user.get_age() >= 74) {
                simulation_logger.debug("Performing rmd...");
                if (dev.is_dev) {
                    profiler.start("process_rmd");
                }
                process_rmd(simulation_state, rmd_table);
                if (dev.is_dev) {
                    profiler.end("process_rmd");
                }
            }

            simulation_logger.debug("Updating investments...");
            if (dev.is_dev) {
                profiler.start("update_investment");
            }
            update_investment(simulation_state);
            if (dev.is_dev) {
                profiler.end("update_investment");
            }
            if (simulation_state.roth_conversion_opt) {
                simulation_logger.debug("Running roth conversion optimizer...");
                if (dev.is_dev) {
                    profiler.start("run_roth_conversion_optimizer");
                }
                run_roth_conversion_optimizer(simulation_state);
                if (dev.is_dev) {
                    profiler.end("run_roth_conversion_optimizer");
                }
            }
            
            simulation_logger.debug(`Paying non discretionary expenses...`);
            if (dev.is_dev) {
                profiler.start("pay_mandatory_expenses");
            }
            if (!pay_mandatory_expenses(simulation_state)) {
                simulation_logger.info(`User cannnot pay all non discretionary expenses`);
                return false;
            }
            if (dev.is_dev) {
                profiler.end("pay_mandatory_expenses");
            }
            
            simulation_logger.debug(`Paying discretionary expenses`);
            if (dev.is_dev) {
                profiler.start("pay_discretionary_expenses");
            }
            pay_discretionary_expenses(simulation_state);
            if (dev.is_dev) {
                profiler.end("pay_discretionary_expenses");
            }

            simulation_logger.debug(`Running invest event scheduled for current year...`);
            if (dev.is_dev) {
                profiler.start("run_invest_event");
            }
            run_invest_event(simulation_state);
            if (dev.is_dev) {
                profiler.end("run_invest_event");
            }

            simulation_logger.debug(`Running rebalance events scheduled for the current year...`);
            if (dev.is_dev) {
                profiler.start("run_rebalance_investment");
            }
            run_rebalance_investment(simulation_state);
            if (dev.is_dev) {
                profiler.end("run_rebalance_investment");
            }

            simulation_result.update(simulation_state);
            return true;
        } catch (error) {
            simulation_logger.error(`simulate_year failed: ${error instanceof Error? error.message: String(error)}`)
            throw new Error(`simulate_year failed: ${error instanceof Error? error.message: String(error)}`)
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