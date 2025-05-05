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
import { create_scenario } from "../domain/Scenario";
import { create_tax_brackets, TaxBracketSet } from "../tax/TaxBrackets";
import { TaxFilingStatus } from "../Enums";
import { create_standard_deductions } from "../tax/StandardDeduction";
import { create_federal_service_wo, FederalTaxService } from "../tax/FederalTaxService";
import { create_state_tax_service_wo, StateTaxService } from "../tax/StateTaxService";
import { hash } from "bcrypt";

function create_federal_service_from_scratch(
    federal_tax_service_taxable_income_bracket_raw: Map<TaxFilingStatus, TaxBracketSet>,
    federal_tax_service_capital_gains_bracket_raw: Map<TaxFilingStatus, TaxBracketSet>,
    federal_tax_service_standard_deductions_raw: Map<TaxFilingStatus, number>,
): FederalTaxService {

    const taxable_income_bracket = create_tax_brackets();
    for (const status of federal_tax_service_taxable_income_bracket_raw.keys()) {
        if (!federal_tax_service_taxable_income_bracket_raw.has(status)) {
            simulation_logger.error(`Failed to prepare federal service. taxable_income_bracket_raw does not contain status ${status}`);
            throw new Error(`Failed to prepare federal service. taxable_income_bracket_raw does not contain status ${status}`);
        }
        for (const bracket of federal_tax_service_taxable_income_bracket_raw.get(status)!) {
            taxable_income_bracket.add_bracket(bracket.min, bracket.max, bracket.rate, status);
        }
    }

    const capital_gains_bracket = create_tax_brackets();
    for (const status of federal_tax_service_capital_gains_bracket_raw.keys()) {
        if (!federal_tax_service_capital_gains_bracket_raw.has(status)) {
            simulation_logger.error(`Failed to prepare federal service. capital gains bracket raw does not contain status ${status}`);
            throw new Error(`Failed to prepare federal service. capital gains bracket raw does not contain status ${status}`);
        }
        for (const bracket of federal_tax_service_capital_gains_bracket_raw.get(status)!) {
            capital_gains_bracket.add_bracket(bracket.min, bracket.max, bracket.rate, status);
        }
    }

    const standard_deductions = create_standard_deductions();
    for (const status of federal_tax_service_standard_deductions_raw.keys()) {
        if (!federal_tax_service_standard_deductions_raw.has(status)) {
            simulation_logger.error(`Failed to prepare federal service. standard deduction raw does not contain status ${status}`);
            throw new Error(`Failed to prepare federal service. standard deduction raw does not contain status ${status}`);
        }
        
        standard_deductions.add_deduction(federal_tax_service_standard_deductions_raw.get(status)!, status);
    }

    return create_federal_service_wo(taxable_income_bracket, capital_gains_bracket, standard_deductions);
}

function create_state_tax_from_scratch(
    state_tax_service_taxable_income_bracket_raw: Map<TaxFilingStatus, TaxBracketSet>
): StateTaxService {
    const taxable_income_bracket = create_tax_brackets();
    for (const status of state_tax_service_taxable_income_bracket_raw.keys()) {
        if (!state_tax_service_taxable_income_bracket_raw.has(status)) {
            simulation_logger.error(`Failed to prepare federal service. taxable_income_bracket_raw does not contain status ${status}`);
            throw new Error(`Failed to prepare federal service. taxable_income_bracket_raw does not contain status ${status}`);
        }
        for (const bracket of state_tax_service_taxable_income_bracket_raw.get(status)!) {
            taxable_income_bracket.add_bracket(bracket.min, bracket.max, bracket.rate, status);
        }
    }
    return create_state_tax_service_wo(taxable_income_bracket);
}


export async function execute_single_simulation(
    simulation_environment: SimulationEnvironment, 
    index: number,          // an identifier for simulation 
): Promise<SimulationYearlyResult> {

    const derived_seed = (`${simulation_environment.base_seed}-${index}`);
    simulation_logger.info(`Derived seed for simuation ${index} is ${derived_seed}`);
    const scenario = create_scenario(simulation_environment.scenario_raw, derived_seed);
    simulation_logger.info("Successfully created scenario from sratch");
    const federal_tax_service = create_federal_service_from_scratch(
        simulation_environment.federal_tax_service_taxable_income_bracket_raw,
        simulation_environment.federal_tax_service_capital_gains_bracket_raw,
        simulation_environment.federal_tax_service_standard_deductions_raw,
    );
    simulation_logger.info("Successfully created federal tax service from sratch");
    const state_tax_service = create_state_tax_from_scratch(
        simulation_environment.state_tax_service_taxable_income_bracket_raw
    );
    simulation_logger.info("Successfully created state tax service from sratch");
    const simulation_state = await create_simulation_state(
        scenario, 
        federal_tax_service, 
        state_tax_service,
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
    profiler?: Profiler
): boolean {
    try {
        simulation_logger.info(
            `Simulating new year ${simulation_state.get_current_year()}`, 
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
                profiler?.end("process_rmd");
            }
        }
                    
        simulation_logger.info("Updating investments...");
        profiler?.start("update_investment");
        update_investment(simulation_state);
        profiler?.end("update_investment");
        if (simulation_state.roth_conversion_opt) {
            simulation_logger.debug("Running roth conversion optimizer...");
            profiler?.start("process_roth_conversion");
            process_roth_conversion(simulation_state);
            profiler?.end("process_roth_conversion");
        }
        
        simulation_logger.info(`Paying non discretionary expenses...`);
        profiler?.start("pay_mandatory_expenses");
        if (!pay_mandatory_expenses(simulation_state)) {
            simulation_logger.info(`User cannnot pay all non discretionary expenses`);
            return false;
        }
        profiler?.end("pay_mandatory_expenses");
        
        simulation_logger.info(`Paying discretionary expenses`);
        profiler?.start("pay_discretionary_expenses");
        pay_discretionary_expenses(simulation_state);
        profiler?.end("pay_discretionary_expenses");

        simulation_logger.info(`Running invest event scheduled for current year...`);
        profiler?.start("run_invest_event");
        run_invest_event(simulation_state);
        profiler?.end("run_invest_event");
        simulation_logger.info(`cash right after invest event: ${simulation_state.account_manager.cash.get_value()}`);

        simulation_logger.info(`Running rebalance events scheduled for the current year...`);
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
