// src/core/simulation/RothConversion.ts
import { SimulationState } from "../SimulationState";
import { IncomeType, TaxStatus } from "../../Enums";
import { AccountMap } from "../../domain/AccountManager";
import { simulation_logger } from "../../../utils/logger/logger";
import { state } from "@stdlib/random-base-normal";

function transfer_investment(
    roth_conversion_strategy: string[], 
    amt: number, 
    source_pool: AccountMap, 
    target_pool: AccountMap) {
    
    // the amount been transferred
    let transferred = 0;

    for (let i = 0; i < roth_conversion_strategy.length && transferred < amt; i++) {
        const label = roth_conversion_strategy[i];
        const from_investment = source_pool.get(label);
        if (!from_investment) {
            console.error(`Investment with label ${label} not exist`);
            process.exit(1);
        }
        if (!target_pool.has(label)) {
            const cloned_investment = from_investment.clone();
            cloned_investment.tax_status = TaxStatus.AFTER_TAX
            target_pool.set(label, cloned_investment);
        }
        const to_investment = target_pool.get(label);
        // if we have nothing in investment, nothing is transferred
        const transfer_amt = Math.min(from_investment.get_value(), amt);
        from_investment.incr_value(-transfer_amt);
        to_investment?.incr_value(transfer_amt);
        transferred += transfer_amt;
    }
}

function process_roth_conversion(simulation_state: SimulationState) {
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
        transfer_investment(
            simulation_state.roth_conversion_strategy,
            transfer_amt,
            simulation_state.account_manager.pre_tax,
            simulation_state.account_manager.after_tax
        );
        simulation_state.user_tax_data.incr_cur_year_income(transfer_amt);
    }
}

export default process_roth_conversion;