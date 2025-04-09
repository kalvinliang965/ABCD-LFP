import { Cloneable } from "../../../utils/helper";
import { RebalanceEventRaw } from "../raw/event_raw/rebalance_event_raw";
import { Event, parse_duration, parse_start_year } from "./Event";

export interface RebalanceEvent extends Event, Cloneable<RebalanceEvent> {
  asset_allocation: Map<string, number>;
  clone(): RebalanceEvent;
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
      clone: () => create_rebalance_event(raw_data),
    };
  } catch (error) {
    throw new Error(`Failed to initialize RebalanceEvent: ${error}`);
  }
}

export default create_rebalance_event;
