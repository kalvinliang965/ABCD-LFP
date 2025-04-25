import { SimulationState } from "../SimulationState";
import { tax_config } from "../../../config/tax";
import { simulation_logger } from "../../../utils/logger/logger";
import { transfer_investment_value } from "./common";


/**
 * Process Required Minimum Distributions (RMDs) for the user
 */
export async function process_rmds(
  simulation_state: SimulationState,
  rmd_factor: Map<number, number>
) {
  
  // user age from previous year
  const prev_user_age = simulation_state.user.get_age() - 1;
  
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
  const total_prev_tax_balance = simulation_state.total_pre_tax_value.get(prev_user_age);

  // there are no investment with tax status = "pre tax" user own
  if (!total_prev_tax_balance || total_prev_tax_balance <= 0) {
    return;
  }

  // step d
  const rmd = total_prev_tax_balance / distribution_period;
  
  // step e: incrase cur year income
  simulation_state.user_tax_data.incr_cur_year_income(rmd);

  
  // Find cash account for receiving the RMD
  let cash_account = simulation_state.account_manager.cash;
  
  if (!cash_account) {
    simulation_logger.error("cash account is lost");
    throw new Error("Cash account is lost");
  }
  
  if (rmd > 0) {
      transfer_investment_value(
          simulation_state.rmd_strategy,
          rmd,
          simulation_state.account_manager.pre_tax,
          simulation_state.account_manager.non_retirement
      );
  }
}
