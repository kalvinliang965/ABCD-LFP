// src/core/simulation/RothConversion.ts
import { AccountMap, SimulationState } from "./SimulationState";
import { IncomeType, TaxStatus } from "../Enums";

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
            process.exit(1); // will change it later when writing test cases.
        }
        if (!target_pool.has(label)) {
            const cloned_investment = from_investment.clone();
            cloned_investment.taxStatus = TaxStatus.AFTER_TAX
            target_pool.set(label, cloned_investment);
        }
        const to_investment = target_pool.get(label);
        // if we have nothing in investment, nothing is transferred
        const transfer_amt = Math.min(from_investment.get_cost_basis(), amt);
        from_investment.incr_cost_basis(-transfer_amt);
        to_investment?.incr_cost_basis(transfer_amt);
        transferred += transfer_amt;
    }
}

function process_roth_conversion(simulation_state: SimulationState) {
    if (!simulation_state.roth_conversion_opt) {
        console.error("roth conversion is not enabled");
        return;
    }
    if (simulation_state.get_current_year() < simulation_state.roth_conversion_start 
        || simulation_state.get_current_year() > simulation_state.roth_conversion_end) {
            console.log("not within roth conversion time frame");
        return;
    }
    const income = simulation_state.get_ordinary_income() 
                    + simulation_state.get_capital_gains_income();
    const taxable_income = income - 0.15 * simulation_state.get_social_security_income();
    const current_bracket = simulation_state
                    .federal_tax_service
                    .find_bracket(taxable_income, IncomeType.TAXABLE_INCOME, simulation_state.get_tax_filing_status());
    const upper = current_bracket.max;
    const transfer_amt = Math.min(
        upper - taxable_income,
        simulation_state.get_after_tax_contribution_limit() - simulation_state.get_after_tax_contribution(),
    );
    if (transfer_amt > 0) {
        transfer_investment(
            simulation_state.roth_conversion_strategy,
            transfer_amt,
            simulation_state.accounts.pre_tax,
            simulation_state.accounts.after_tax
        );
        simulation_state.incr_ordinary_income(transfer_amt);
        simulation_state.incr_after_tax_contribution(transfer_amt);
    }
}

export default process_roth_conversion;