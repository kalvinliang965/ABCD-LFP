// src/core/simulation/UpdateInvestment.ts

import { ChangeType } from "../Enums";
import { SimulationState } from "./SimulationState";

export function update_investment(simulation_state: SimulationState) {

    for (const investment of simulation_state.investments) {
        const return_rate = investment.get_annual_return();

        let gains = 0
        if (investment.return_change_type === ChangeType.PERCENTAGE) {
            gains = investment.get_value() * (1 + return_rate);
        } else if (investment.return_change_type === ChangeType.FIXED) {
            gains = investment.get_value() + return_rate;
        } else {
            throw Error(`Failed to update investment due to invalid change type ${investment.return_change_type}`)
        }

        // remove annual fee
        const avg = (gains) // 2
        const expense = avg * investment.get_expense_ratio();
        gains -= expense;
        
        const dividend = investment.get_value() * investment.get_annual_income();
        if (!investment.is_retirement() && !investment.is_tax_exempt()) {
            simulation_state.incr_capital_gains_income(gains);
            simulation_state.incr_taxable_income(dividend)
        }
        investment.incr_value(gains);
        // reinvest the dividend/interest back to this investment
        investment.incr_cost_basis(dividend);
    }
}