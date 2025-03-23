// src/core/simulation/UpdateInvestment.ts

import { ChangeType, TaxStatus } from "../Enums";
import { SimulationState } from "./SimulationState";
import { AccountMap } from "./SimulationState";


export default function update_investment(simulation_state: SimulationState) {
    
    // we could just iterate the non-retirment account list
    // but here i just wanna double check for invalid account type
    const account_maps: Array<AccountMap> = [
        simulation_state.accounts.after_tax,
        simulation_state.accounts.non_retirement,
        simulation_state.accounts.pre_tax
    ];
    
    for (const account_map of account_maps) {
        for (const [id, investment] of account_map.entries()) {
            

            // steps d: capital gains
            // since it is relative to beginning of the year, we calculate this first
            let annual_gains = 0
            const return_change = investment.get_annual_return();
            if (investment.return_change_type === ChangeType.PERCENTAGE) {
                annual_gains = investment.get_value() *  return_change;
            } else if (investment.return_change_type === ChangeType.FIXED) {
                annual_gains = return_change;
            } else {
                throw Error(`Failed to update investment due to invalid change type ${investment.return_change_type}`)
            }

            // step a
            let annual_income = 0
            const income_change = investment.get_annual_income();
            if (investment.income_change_type === ChangeType.PERCENTAGE) {
                annual_income =  investment.get_value() * income_change;
            } else if (investment.income_change_type === ChangeType.FIXED) {
                annual_income = income_change;
            } else {
                throw Error(`Failed to update investment due to invalid change type ${investment.return_change_type}`)
            }

            // step b and validating
            switch (investment.taxStatus) {
                case TaxStatus.NON_RETIREMENT:
                    // add income to curYearIncome
                    if (!investment.is_tax_exempt()) {
                        simulation_state.incr_ordinary_income(annual_income);
                    }
                    break;
                case TaxStatus.AFTER_TAX:
                    break;
                case TaxStatus.PRE_TAX:
                    break;
                default:
                    console.error(`Invalid account type: ${investment.taxStatus}`);
            }

            const investment_previous_value = investment.get_value();
            //steps c: add income to value of investment
            investment.incr_value(annual_income);
            
            // steps e remove annual fee
            const avg = (investment.get_value() + investment_previous_value) / 2
            const expense = avg * investment.get_expense_ratio();
            investment.incr_value(-expense);
            
            simulation_state.incr_capital_gains_income(annual_gains);
            simulation_state.incr_ordinary_income(annual_income);
        }
    }
}