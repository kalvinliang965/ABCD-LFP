// src/core/simulation/ProcessIncome.ts

import { ChangeType } from "../../Enums";
import { SimulationState } from "../SimulationState";
import { simulation_logger } from "../../../utils/logger/logger";


// run income events, adding the income to cash investment
// note: tax is calculate in another step
export default async function run_income_event(
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
    const initial_amount = event.initial_amount;
    simulation_logger.debug(`initial amount: ${initial_amount}`);
    const annual_change = event.expected_annual_change.sample();
    simulation_logger.debug(`annual change: ${annual_change}`);
    const change_type = event.change_type;
    simulation_logger.debug(`change type: ${change_type}`);
    let change;
    if (change_type === ChangeType.FIXED) {
      change = annual_change;
    } else if (change_type === ChangeType.PERCENTAGE) {
      change = annual_change * initial_amount
    } else {
      simulation_logger.error(`event ${event.name} contain invalid change_type ${event.change_type}`)
      throw new Error(`Invalid Change type ${change_type}`);
    }
    let current_amount = initial_amount + change;
    // update the event
    event.initial_amount = current_amount;
    simulation_logger.debug(`Updated amount: ${current_amount}`);

    // step b: adjust for inflation
    if (event.inflation_adjusted) {
      simulation_logger.debug(`Event is inflation adjusted with inflation factor: ${state.inflation_factor}`);
      current_amount *= (1 + state.inflation_factor);  
    }

    // if both are alive, we use the entire amount
    let user_gains=current_amount;
    // step c: ignore spouse portion if they died
    if (!spouse_alive) {
      simulation_logger.debug(`Spouse is not alive. User own ${event.user_fraction} of the event`);
      user_gains *= event.user_fraction;
    }
    simulation_logger.debug(`User gained ${user_gains}`);

    // step d: add income to cash investment
    state.account_manager.cash.incr_value(user_gains);

    // step e: update total cur_year_income
    state.user_tax_data.incr_cur_year_income(user_gains);

    // step f: update total cur year social security bennefit income.
    if (event.social_security) {
      state.user_tax_data.incr_social_security(user_gains);
    }

    // update income breakdown in event manager
    state.event_manager.update_income_breakdown(event.name, user_gains);
  }
}

