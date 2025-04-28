import { tax_config } from "../../config/tax";
import { get_rmd_factors_from_db, save_rmd_factors_to_db } from "../../db/repositories/RMDFactorRepository";
import { get_scenario_from_db } from "../../db/repositories/ScenarioRepository";
import { delete_state_tax_brackets_by_state } from "../../db/repositories/StateTaxBracketRepository";
import { fetch_and_parse_rmd } from "../../services/RMDScraper";
import { simulation_logger } from "../../utils/logger/logger";
import { Profiler } from "../../utils/Profiler";
import { ScenarioRaw } from "../domain/raw/scenario_raw";
import { Scenario } from "../domain/scenario/Scenario";
import { create_federal_tax_service, FederalTaxService } from "../tax/FederalTaxService";
import { create_state_tax_service_db, create_state_tax_service_yaml, StateTaxService } from "../tax/StateTaxService";

export interface SimulationEnvironment {
    federal_tax_service: FederalTaxService;
    state_tax_service: StateTaxService;
    rmd_table: Map<number, number>;
    scenario: Scenario; 
    profiler?: Profiler;
}

const get_rmd_factors = async() => {
    let res = await get_rmd_factors_from_db();
    // if rmd factor is not already scrapped.
    if (res.size == 0) {
        res = await fetch_and_parse_rmd(tax_config.RMD_URL);
        await save_rmd_factors_to_db(res);
    } 
    return res;
}

export async function create_simulation_environment_parallel(
    scenario_id: string,
): Promise<SimulationEnvironment> {
    try {
        const [scenario, federal_tax_service, rmd_table] =  await Promise.all([
            get_scenario_from_db(scenario_id), 
            create_federal_tax_service(), 
            get_rmd_factors()
        ])
        // need to know scenario first.
        const state_tax_service = await create_state_tax_service_db(scenario.residence_state);
        return {
            federal_tax_service,
            state_tax_service,
            rmd_table,
            scenario,
        }
    } catch (error) {
        simulation_logger.error(`Failed to create simulation environment ${error instanceof Error? error.stack: String(error)}`);
        throw new Error(`Failed to create simulation environment ${error instanceof Error? error.message: String(error)}`);
    }
}

export async function create_simulation_environment(
    scenario_id: string,
): Promise<SimulationEnvironment> {

    let scenario: Scenario, federal_tax_service: FederalTaxService, state_tax_service: StateTaxService, rmd_table: Map<number, number>;
    try {
        scenario = await get_scenario_from_db(scenario_id);

        // initialize federal tax service
        simulation_logger.debug("initializing federal tax service...");
        federal_tax_service = await create_federal_tax_service();
        simulation_logger.info("Successfully initialize federal tax service");
        
        // initialize state tax service 
        simulation_logger.debug("initializing state tax service from db....");
        state_tax_service = await create_state_tax_service_db(scenario.residence_state); 
        simulation_logger.info("Successfully initialize state tax service from db");

        // TODO: Maybe i could do something like this(bulk write) for federal tax scraping to optimize my code.
        rmd_table = await get_rmd_factors_from_db();
        // if rmd factor is not already scrapped.
        if (rmd_table.size == 0) {
            rmd_table = await fetch_and_parse_rmd(tax_config.RMD_URL);
            await save_rmd_factors_to_db(rmd_table);
        } 

        return {
            federal_tax_service,
            state_tax_service,
            rmd_table,
            scenario,
        }

    } catch (error) {
        simulation_logger.error(`Failed to create simulation environment ${error instanceof Error? error.stack: String(error)}`);
        throw new Error(`Failed to create simulation environment ${error instanceof Error? error.message: String(error)}`);
    }
}