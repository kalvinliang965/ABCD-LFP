import { InvestmentEventRaw } from "../scenario/Scenario";
import { Event, parse_duration, parse_start_year } from "./Event";

interface InvestmentEvent extends Event {
  initial_amount: number;
}

function create_investment_event(
  raw_data: InvestmentEventRaw
): InvestmentEvent {
  try {
    const start = parse_start_year(raw_data.start);
    const duration = parse_duration(raw_data.duration);

    return {
      name: raw_data.name,
      start,
      duration,
      type: raw_data.type,
      initial_amount: raw_data.initialAmount,
    };
  } catch (error) {
    throw new Error(`Failed to initialize InvestmentEvent: ${error}`);
  }
}

export default create_investment_event;
