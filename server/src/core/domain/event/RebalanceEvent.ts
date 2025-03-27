import { RebalanceEventRaw } from "../scenario/Scenario";
import { Event, parse_duration, parse_start_year } from "./Event";

interface RebalanceEvent extends Event {
  asset_allocation: Map<string, number>;
}

function create_rebalance_event(raw_data: RebalanceEventRaw): RebalanceEvent {
  try {
    const start = parse_start_year(raw_data.start);
    const duration = parse_duration(raw_data.duration);

    return {
      name: raw_data.name,
      start,
      duration,
      type: raw_data.type,
      asset_allocation: raw_data.assetAllocation,
    };
  } catch (error) {
    throw new Error(`Failed to initialize RebalanceEvent: ${error}`);
  }
}

export default create_rebalance_event;
