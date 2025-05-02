import { Cloneable } from "../../../utils/CloneUtil";
import { ValueSource } from "../../../utils/ValueGenerator";
import { RebalanceEventRaw } from "../raw/event_raw/rebalance_event_raw";
import { Event, parse_duration, parse_start_year } from "./Event";

export interface RebalanceEvent extends Event, Cloneable<RebalanceEvent> {
  asset_allocation: Map<string, number>;
  clone(): RebalanceEvent;
}

function create_rebalance_event(raw_data: RebalanceEventRaw, value_source: ValueSource): RebalanceEvent {
  try {
    const start = parse_start_year(raw_data.start, value_source);
    const duration = parse_duration(raw_data.duration, value_source);

    return {
      name: raw_data.name,
      start,
      duration,
      type: raw_data.type,
      asset_allocation: new Map(Object.entries(raw_data.assetAllocation)),
      clone: () => create_rebalance_event(raw_data, value_source),
    };
  } catch (error) {
    throw new Error(`Failed to initialize RebalanceEvent: ${error}`);
  }
}

export default create_rebalance_event;
