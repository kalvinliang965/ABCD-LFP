// ! This module contain function that run ONE simulation

import { SimulationEnvironment } from "./ LoadSimulationEnvironment";
import { create_simulation_state, SimulationState } from "./SimulationState";
import { create_simulation_yearly_result, SimulationYearlyResult } from "./SimulationYearlyResult";
import { simulation_logger } from "../../utils/logger/logger";
import { Profiler } from "../../utils/Profiler";
import { run_income_event } from "./logic/RunIncomeEvent";
import { process_rmd } from "./logic/ProcessRMD";
import { update_investment } from "./logic/UpdateInvestment";
import { process_roth_conversion } from "./logic/RothConversion";
import { pay_mandatory_expenses } from "./logic/PayMandatoryExpense";
import { pay_discretionary_expenses } from "./logic/PayDiscretionaryExpense";
import { run_invest_event } from "./logic/InvestExcessCash";
import { run_rebalance_investment } from "./logic/RebalanceInvestments";


export async function execute_single_simulation(
    simulation_environment: SimulationEnvironment, 
): Promise<SimulationYearlyResult> {

    const simulation_state = await create_simulation_state(
        simulation_environment.scenario, 
        simulation_environment.federal_tax_service, 
        simulation_environment.state_tax_service
    ); 
    const simulation_result = create_simulation_yearly_result();
    
    while (is_simulation_active(simulation_state)) {
        // adjust for tax, inflation, etc...
        simulation_state.setup();
        if (!simulate_year(simulation_environment.rmd_table, simulation_state, simulation_result, simulation_environment.profiler)) {
            simulation_logger.info(`
                User cannot pay all mandatory expense for ${simulation_state.get_current_year()}
            `);
            break;
        }
        // increase uesr age and tax status
        simulation_state.advance_year();
    }

    return simulation_result;
}

function is_simulation_active(simulation_state: SimulationState):boolean {
    return simulation_state.user.is_alive();
}

function simulate_year(
    rmd_table: Map<number, number>,
    simulation_state: SimulationState, 
    simulation_result: SimulationYearlyResult, 
    profiler: Profiler | undefined
): boolean {
    try {
        simulation_logger.debug(
            "Simulating new year", 
            {
                simulation_state: simulation_state,
            }
        ); 

        simulation_logger.debug("Running income events");
        profiler?.start("run_income_event");
        run_income_event(simulation_state);
        profiler?.end("run_income_event");
        
        if (simulation_state.user.get_age() >= 74) {
            simulation_logger.debug("Performing rmd...");
            profiler?.start("process_rmd");
            process_rmd(simulation_state, rmd_table);
            if (profiler) {
                profiler.end("process_rmd");
            }
        }

        simulation_logger.debug("Updating investments...");
        profiler?.start("update_investment");
        update_investment(simulation_state);
        profiler?.end("update_investment");
        if (simulation_state.roth_conversion_opt) {
            simulation_logger.debug("Running roth conversion optimizer...");
            profiler?.start("process_roth_conversion");
            process_roth_conversion(simulation_state);
            profiler?.end("process_roth_conversion");
        }
        
        simulation_logger.debug(`Paying non discretionary expenses...`);
        profiler?.start("pay_mandatory_expenses");
        if (!pay_mandatory_expenses(simulation_state)) {
            simulation_logger.info(`User cannnot pay all non discretionary expenses`);
            return false;
        }
        profiler?.end("pay_mandatory_expenses");
        
        simulation_logger.debug(`Paying discretionary expenses`);
        profiler?.start("pay_discretionary_expenses");
        pay_discretionary_expenses(simulation_state);
        profiler?.end("pay_discretionary_expenses");

        simulation_logger.debug(`Running invest event scheduled for current year...`);
        profiler?.start("run_invest_event");
        run_invest_event(simulation_state);
        profiler?.end("run_invest_event");

        simulation_logger.debug(`Running rebalance events scheduled for the current year...`);
        profiler?.start("run_rebalance_investment");
        run_rebalance_investment(simulation_state);
        profiler?.end("run_rebalance_investment");

        simulation_result.update(simulation_state);
        return true;
    } catch (error) {
        simulation_logger.error(`simulate_year failed: ${error instanceof Error? error.message: String(error)}`)
        throw new Error(`simulate_year failed: ${error instanceof Error? error.message: String(error)}`)
    }
}
