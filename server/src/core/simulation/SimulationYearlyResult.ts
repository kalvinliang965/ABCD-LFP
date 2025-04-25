import { SimulationState } from "./SimulationState"

// edit: I dont think financial goal is needed here
interface YearResult {

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
    mandatory_expenses: number;
    discretionary_expenses: number;
    total_expenses: number;
    expense_breakdown: {
        expenses: Record<string, number>;
        taxes: number; //previous years taxes
    };
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
            //get expenses
            // next 3 lines under question since it depends on the expense logic update
            const total_expenses = simulation_state.event_manager.get_total_expenses();
            const expense_breakdown = simulation_state.event_manager.get_expense_breakdown();

            //previous years tax to have a breakdown of expense
            const prev_year_tax_base = simulation_state.event_manager.get_last_year_tax_totals()?.total || 0;

            //collect data for the year:
            //we need to know total inv value, i did not find one
            //and we need the investments recorded for each year
            const investments: Record<string, number> = {};
            
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
                income_breakdown: simulation_state.event_manager.get_income_breakdown(),
                mandatory_expenses: total_expenses.mandatory,
                discretionary_expenses: total_expenses.discretionary,
                total_expenses: total_expenses.mandatory + total_expenses.discretionary,
                expense_breakdown: {
                    expenses: expense_breakdown,
                    taxes: prev_year_tax_base
                },
            };

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