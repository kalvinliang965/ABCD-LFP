import { clone_map } from "../../utils/CloneUtil";
import { Investment } from "../domain/investment/Investment";
import { SimulationState } from "./SimulationState"
import lodash from "lodash";

// edit: I dont think financial goal is needed here
// this is kalvin's code
export interface YearResult {

    // Here are the one haifeng ask for
    year: number;
    // using the three value here we can get total investment
    total_after_tax: number,
    total_pre_tax: number,
    total_non_retirement: number,
    is_goal_met: boolean;
    
    // the one below are written by kate
    cash_value: number;
    investments: Record<string, number>;//flat map of investment IDs to values
    cur_year_income: number;
    cur_year_social_security: number;
    cur_year_capital_gains: number;
    cur_year_after_tax_contributions: number;
    cur_year_early_withdrawals: number;
    income_breakdown: Record<string, number>; 
    mandatory_expenses: Record<string, number>;
    discretionary_expenses: Record<string, number>;
    //% of discretionary expenses needs to be stored, tbd
}



export interface SimulationYearlyResult {
    yearly_results: Array<YearResult>,
    update(simulation_state: SimulationState): void,
    success_probability(): number,
} 

// take in the name of the scenario...
export function create_simulation_yearly_result(): SimulationYearlyResult {
    let success = 0;
    // we dont need a fast look up, so array is fine
    const yearly_results: YearResult[] = [];
    return {
        yearly_results,
        update: async (simulation_state: SimulationState) => {
  
            const investments: Record<string, number> = {};

            for (const inv of simulation_state.account_manager.all.values()) {
                if (inv.id in investments) {
                    throw new Error(`Duplicate inv.id ${inv.id}`);
                }
                investments[inv.id] = inv.get_value();
            }
            
            const year_snapshot: YearResult = {
                // Here are the one haifeng ask for
                year: simulation_state.get_current_year(),
                total_after_tax: simulation_state.account_manager.get_total_after_tax_value(),
                total_pre_tax: simulation_state.account_manager.get_total_pre_tax_value(),
                total_non_retirement: simulation_state.account_manager.get_total_non_retirement_value(),
                is_goal_met: simulation_state.account_manager.get_net_worth() >= simulation_state.get_financial_goal(),

                // here are the one kate added but haifeng didnt ask for
                cash_value: simulation_state.account_manager.cash.get_value(), 
                investments,
                cur_year_income: simulation_state.user_tax_data.get_cur_year_income(),
                cur_year_social_security: simulation_state.user_tax_data.get_cur_year_ss(),
                cur_year_capital_gains: simulation_state.user_tax_data.get_cur_year_gains(),
                cur_year_after_tax_contributions: simulation_state.user_tax_data.get_cur_after_tax_contribution(),
                cur_year_early_withdrawals: simulation_state.user_tax_data.get_cur_year_early_withdrawal(),
                income_breakdown: { ...simulation_state.event_manager.income_breakdown },
                mandatory_expenses: { ...simulation_state.event_manager.mandatory_expenses },
                discretionary_expenses: { ...simulation_state.event_manager.discretionary_expenses },
            };

            if (yearly_results.length > 0 && yearly_results[yearly_results.length - 1].year === year_snapshot.year) {
                throw new Error(`Year already exist ${year_snapshot.year}`);
            }
            //push the snapshot into the result
            yearly_results.push(year_snapshot);
            //update success count if goal is met
            if (year_snapshot.is_goal_met) {
                success++;
            }
        },

        success_probability: () => {
            return yearly_results.length > 0 ? success / yearly_results.length : 0;
        }
    }
}