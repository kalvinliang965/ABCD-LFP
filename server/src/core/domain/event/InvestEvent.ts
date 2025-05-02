import { InvestEventRaw } from "../raw/event_raw/investment_event_raw";
import { Event, parse_duration, parse_start_year } from "./Event";
import { Cloneable } from "../../../utils/CloneUtil";
import { ValueSource } from "../../../utils/ValueGenerator";

export interface InvestEvent extends Event, Cloneable<InvestEvent> {
  max_cash: number;
  asset_allocation: Map<string, number>;
  asset_allocation2: Map<string, number>;
  glide_path: boolean;
  clone(): InvestEvent;
}

function create_invest_event(
  raw_data: InvestEventRaw,
  value_source: ValueSource,
): InvestEvent {
  try {
    const start = parse_start_year(raw_data.start, value_source);
    const duration = parse_duration(raw_data.duration, value_source);

    return {
      name: raw_data.name,
      start,
      duration,
      type: raw_data.type,
      max_cash: raw_data.maxCash,
      asset_allocation: new Map(Object.entries(raw_data.assetAllocation)),
      asset_allocation2: new Map(Object.entries(raw_data.assetAllocation2)),
      glide_path: raw_data.glidePath,
      clone: () => create_invest_event(raw_data, value_source),
    };
  } catch (error) {
    throw new Error(`Failed to initialize InvestmentEvent: ${error}`);
  }
}

export default create_invest_event;
