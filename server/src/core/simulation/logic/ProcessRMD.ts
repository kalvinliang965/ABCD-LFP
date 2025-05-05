import { SimulationState } from "../SimulationState";
import { tax_config } from "../../../config/tax";
import { simulation_logger } from "../../../utils/logger/logger";
import { transfer_investment_value } from "./common";
import { state } from "@stdlib/random-base-normal";

/**
 * Process Required Minimum Distributions (RMDs) for the user
 */
export async function process_rmd(
  simulation_state: SimulationState,
  rmd_factor: Map<number, number>
) {
  try {

    // user age from previous year
    const prev_user_age = simulation_state.user.get_age() - 1;
    simulation_logger.debug(`User's previous year age ${prev_user_age}`);
    
    // step a: The first RMD is for the year in which the user turns 73, and is paid in the year in which the user turns 74.
    if (prev_user_age < tax_config.RMD_START_AGE) {
      return;
    }
    
    // step b: Distribution period d = result from lookup of the user’s age in the most recent available RMD table
    const distribution_period = rmd_factor.get(prev_user_age);
    if (!distribution_period) {
      simulation_logger.error(`RMD table is incomplete. Missing age ${prev_user_age}`)
      throw new Error(`RMD table is incomplete. Missing age ${prev_user_age}`)
    }
    
    // step c: get sum of values of the investments with tax status = pre-tax, as of the end of the previous year.
    const total_prev_tax_balance = simulation_state.get_total_prev_prev_tax_value();
    if (total_prev_tax_balance === undefined) {
      throw new Error("Failed RMD: total prev tax balance is undefined");
    }
    simulation_logger.debug(`pre tax value from preivous year ${total_prev_tax_balance}`);

    // there are no investment with tax status = "pre tax" user own
    if (!total_prev_tax_balance || total_prev_tax_balance <= 0) {
      return;
    }

    // step d
    const rmd = total_prev_tax_balance / distribution_period;
    simulation_logger.debug(`rmd to process ${rmd}`);

    // step e: incrase cur year income
    simulation_state.user_tax_data.incr_cur_year_income(rmd);
    
    if (rmd > 0) {
        const transferred = transfer_investment_value(
            simulation_state.rmd_strategy,
            rmd,
            simulation_state.account_manager.pre_tax_group,
            simulation_state.account_manager.non_retirement_group,
            simulation_state.expense_withrawal_strategy,
        );
        simulation_logger.info(`${transferred} is transferred from pre tax to non retirement for rmd processing`);
    }
  } catch (error) {

    simulation_logger.error(`Failed to process rmd: ${error instanceof Error? error.stack: String(error)}`);
    throw new Error(`Failed to process rmd: ${error instanceof Error? error.message: String(error)}`);
  }
}
