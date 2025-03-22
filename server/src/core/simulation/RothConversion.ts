// src/core/simulation/RothConversion.ts

import { SimulationState } from "./SimulationState";
import { FederalTaxService } from "../tax/FederalTaxService";
import { IncomeType } from "../Enums";
import { Investment } from "../domain/investment/Investment";

function transfer_investment(
    roth_conversion_strategy: string[], 
    amt: number, 
    source: Investment, 
    target: Investment) {

        // TODO
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

    const taxable_income = simulation_state.get_ordinary_income();
    const current_bracket = simulation_state
                    .federal_tax_service
                    .find_bracket(taxable_income, IncomeType.TAXABLE_INCOME, simulation_state.tax_filing_status);



}

export default process_roth_conversion;