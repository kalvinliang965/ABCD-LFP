// src/core/simulation/RothConversion.ts

import { SimulationState } from "./SimulationState";
import { FederalTaxService } from "../tax/FederalTaxService";

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

    const taxable_income = simulation_state



}

export default process_roth_conversion;