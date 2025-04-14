// src/core/simulation/UpdateInvestment.ts

import { simulation_logger } from "../../../utils/logger/logger";
import { ChangeType, TaxStatus } from "../../Enums";
import { SimulationState } from "../SimulationState";

export default function update_investment(simulation_state: SimulationState) {
    
    // we could just iterate the non-retirment account list
    // but here i just wanna double check for invalid account type
    for (const investment of simulation_state.account_manager.all.values()) {
        simulation_logger.debug(`Updating investment ${investment.id}`, {
            tax_status: investment.tax_status,
            cost_basis: investment.get_cost_basis(),
            value: investment.get_value(),
            investment_type: investment.investment_type,
        });


        // steps d: capital gains
        // since it is relative to beginning of the year, we calculate this first
        let annual_gains = 0

        const investment_type = simulation_state.investment_type_manager.get(investment.investment_type);
        if (investment_type == undefined) {
            simulation_logger.error(`Investment type ${investment_type} does not exist`);
            throw new Error(`Investment type ${investment_type} does not exist`);
        }
        const return_change = investment_type.get_annual_return();
        simulation_logger.debug(`annual return change ${return_change}, change type: ${investment_type.return_change_type}`);
        if (investment_type.return_change_type === ChangeType.PERCENTAGE) {
            annual_gains = investment.get_value() *  return_change;
        } else if (investment_type.return_change_type === ChangeType.FIXED) {
            annual_gains = return_change;
        } else {
            throw Error(`Failed to update investment due to invalid change type ${investment_type.return_change_type}`)
        }
        simulation_logger.debug(`investment annual gains ${annual_gains}`);

        // step a
        let annual_income = 0
        const income_change = investment_type.get_annual_income();
        simulation_logger.debug(`annual income change ${income_change}, change type: ${investment_type.income_change_type}`);
        if (investment_type.income_change_type === ChangeType.PERCENTAGE) {
            annual_income =  investment.get_value() * income_change;
        } else if (investment_type.income_change_type === ChangeType.FIXED) {
            annual_income = income_change;
        } else {
            throw Error(`Failed to update investment due to invalid change type ${investment_type.return_change_type}`)
        }
        simulation_logger.debug(`investment annual income ${annual_income}`);

        // step b and validating
        switch (investment.tax_status) {
            case TaxStatus.NON_RETIREMENT:
                // add income to curYearIncome
                if (investment_type.taxability) {
                    simulation_state.user_tax_data.incr_cur_year_income(annual_income);
                }
                break;
            case TaxStatus.AFTER_TAX:
                break;
            case TaxStatus.PRE_TAX:
                break;
            default:
                console.error(`Invalid account type: ${investment.tax_status}`);
        }
        const investment_previous_value = investment.get_value();
        investment.incr_value(annual_gains); // update investment value

        //steps c: add income to value of investment
        investment.incr_cost_basis(annual_income);
        
        // steps e remove annual fee
        const avg = (investment.get_value() + investment_previous_value) / 2
        const expense = avg * investment_type.expense_ratio;
        investment.incr_value(-1 * expense);
    }
}