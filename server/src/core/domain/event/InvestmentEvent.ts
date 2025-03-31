import { InvestmentEventRaw } from "../raw/event_raw/investment_event_raw";
import { Event, parse_duration, parse_start_year } from "./Event";

interface InvestmentEvent extends Event {
  max_cash: number;
  asset_allocation: Map<string, number>;
  asset_allocation2: Map<string, number>;
  glide_path: boolean;
  clone(): InvestmentEvent;
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
      max_cash: raw_data.maxCash,
      asset_allocation: raw_data.assetAllocation,
      asset_allocation2: raw_data.assetAllocation2,
      glide_path: raw_data.glidePath,
      clone: () => create_investment_event(raw_data),
    };
  } catch (error) {
    throw new Error(`Failed to initialize InvestmentEvent: ${error}`);
  }
}

export default create_investment_event;
