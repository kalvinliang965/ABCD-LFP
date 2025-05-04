// src/core/simulation/RothConversion.ts
import { SimulationState } from "../SimulationState";
import { IncomeType, TaxStatus } from "../../Enums";
import { simulation_logger } from "../../../utils/logger/logger";
import { transfer_investment_value } from "./common";

export function process_roth_conversion(simulation_state: SimulationState) {
    try {
        if (!simulation_state.roth_conversion_opt) {
            simulation_logger.debug("roth conversion is not enabled");
            return;
        }
        if (simulation_state.get_current_year() < simulation_state.roth_conversion_start 
            || simulation_state.get_current_year() > simulation_state.roth_conversion_end) {
                simulation_logger.debug("not within roth conversion time frame");
            return;
        }

        const income = simulation_state.user_tax_data.get_cur_year_income() 
        const taxable_income = income - 0.15 * simulation_state.user_tax_data.get_cur_year_ss()
        const current_bracket = simulation_state
                        .federal_tax_service
                        .find_bracket_with_income(taxable_income, IncomeType.TAXABLE_INCOME, simulation_state.get_tax_filing_status());
        const standard_deduction = simulation_state
                                        .federal_tax_service
                                        .find_deduction(simulation_state.get_tax_filing_status());
        const upper = current_bracket.max;
        const transfer_amt = upper - (taxable_income - standard_deduction);
        // does not go into annual contribution for after tax
        if (transfer_amt > 0) {
            const transferred = transfer_investment_value(
                simulation_state.roth_conversion_strategy,
                transfer_amt,
                simulation_state.account_manager.pre_tax_group,
                simulation_state.account_manager.after_tax_group,
                simulation_state.expense_withrawal_strategy,
            );
            simulation_logger.info(`${transferred} is transferred from pre tax to after tax for roth conversion`);
            simulation_state.user_tax_data.incr_cur_year_income(transferred);
        }
    } catch(error) {
        simulation_logger.error(`Failed to process roth conversion: ${error instanceof Error? error.stack: String(error)}`);
        throw new Error(`Failed to process roth conversion: ${error instanceof Error? error.message: String(error)}`);
    }
}
