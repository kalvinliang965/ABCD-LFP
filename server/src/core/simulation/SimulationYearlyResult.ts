import { SimulationState } from "./SimulationState"
import { equal_record } from "../../utils/general";

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

            for (const inv of simulation_state.account_manager.all().values()) {
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

function compare_year_result(a: YearResult, b: YearResult): boolean {
    if (a.year !== b.year) return false;
    if (a.total_after_tax !== b.total_after_tax) return false;
    if (a.total_pre_tax !== b.total_pre_tax) return false;
    if (a.total_non_retirement !== b.total_non_retirement) return false;
    if (a.is_goal_met !== b.is_goal_met) return false;
    if (a.cash_value !== b.cash_value) return false;
    if (a.cur_year_income !== b.cur_year_income) return false;
    if (a.cur_year_social_security !== b.cur_year_social_security) return false;
    if (a.cur_year_capital_gains !== b.cur_year_capital_gains) return false;
    if (a.cur_year_after_tax_contributions !== b.cur_year_after_tax_contributions) return false;
    if (a.cur_year_early_withdrawals !== b.cur_year_early_withdrawals) return false;
  
    if (!equal_record(a.investments, b.investments)) return false;
    if (!equal_record(a.income_breakdown, b.income_breakdown)) return false;
    if (!equal_record(a.mandatory_expenses, b.mandatory_expenses)) return false;
    if (!equal_record(a.discretionary_expenses, b.discretionary_expenses)) return false;
  
    return true;
  }
  
export function compare_simulation_yearly_result(
    sr1: SimulationYearlyResult,
    sr2: SimulationYearlyResult,
): boolean {
    const N = sr1.yearly_results.length;
    const M = sr2.yearly_results.length;
    if (N != M) return false;
    for (let i = 0; i < N; ++i) {
        const ys1 = sr1.yearly_results[i];
        const ys2 = sr2.yearly_results[i];
        if (!compare_year_result(ys1, ys2)) {
            return false;
        }
    }
    return true;
}