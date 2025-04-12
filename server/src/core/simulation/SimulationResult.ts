import { SimulationState } from "./SimulationState"

interface YearResult {
  year: number;
  cash_value: number;
  investments: Record<string, number>;//flat map of investment IDs to values
  total_investment_value: number;
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

  financial_goal: number;
  is_goal_met: boolean;
}



export interface SimulationResult {
    update(simulation_state: SimulationState): void,
    success_probability(): number,
} 

export function create_simulation_result(): SimulationResult {
    let success = 0
    const yearly_results: YearResult[] = []
    
    return {
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
            let total_inv_value = 0;

            //non-retirement accounts
            for (const [id, investment] of simulation_state.account_manager.non_retirement.entries()) {
                const value = investment.get_value();
                investments[id] = value;
                total_inv_value += value;
            }

            ///pre-tax accounts
            for (const [id, investment] of simulation_state.account_manager.pre_tax.entries()) {
                const value = investment.get_value();
                investments[id] = value;
                total_inv_value += value;
            }

            //after-tax accounts
            for (const [id, investment] of simulation_state.account_manager.after_tax.entries()) {
                const value = investment.get_value();
                investments[id] = value;
                total_inv_value += value;
            }

            const year_snapshot: YearResult = {
                year: simulation_state.get_current_year(),
                cash_value: simulation_state.account_manager.cash.get_value(), 
                investments,
                total_investment_value: total_inv_value,
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
                financial_goal: simulation_state.get_financial_goal(),
                is_goal_met: false
            };

            //check if financial goal was met 
            year_snapshot.is_goal_met = total_inv_value >= year_snapshot.financial_goal;

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