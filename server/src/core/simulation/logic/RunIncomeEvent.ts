// src/core/simulation/ProcessIncome.ts

import { ChangeType } from "../../Enums";
import { SimulationState } from "../SimulationState";
import { simulation_logger } from "../../../utils/logger/logger";


// run income events, adding the income to cash investment
// note: tax is calculate in another step
export async function run_income_event(
  state: SimulationState
) {
  const current_year = state.get_current_year();
  const spouse_alive = state.spouse?.is_alive() || false;
  // Identify income events that are active in the current year
  const active_income_events = state.event_manager.get_active_income_event(current_year);
  simulation_logger.debug(`${active_income_events.length} active income event is retrieved`);
  // Process income from events
  for (const event of active_income_events) {
    
    simulation_logger.debug(`run income event ${event.name}`);

    // step a: update the initial amount field for this event for next year
    let user_gains=state.event_manager.update_initial_amount(event, state.annual_inflation_rate);

    // step c: ignore spouse portion if they died
    // if both are alive, we use the entire amount
    if (spouse_alive) {
      simulation_logger.debug(`Spouse alive. User own ${event.user_fraction} of the event`);
      user_gains *= event.user_fraction;
    } else {
      simulation_logger.debug(`Spouse is not alive. User own ${event.user_fraction} of the event`);
    }
    simulation_logger.debug(`User gained ${user_gains}`);

    // step d: add income to cash investment
    state.account_manager.cash.incr_value(user_gains);

    // step e: update total cur_year_income
    state.user_tax_data.incr_cur_year_income(user_gains);

    // step f: update total cur year social security bennefit income.
    if (event.social_security) {
      state.user_tax_data.incr_cur_year_ss(user_gains);
    }

    // update income breakdown in event manager
    state.event_manager.update_income_breakdown(event.name, user_gains);
  }
}

