import { Cloneable } from "../../../utils/helper";
import { ValueGenerator } from "../../../utils/math/ValueGenerator";
import { ChangeType } from "../../Enums";
import { IncomeEventRaw } from "../raw/event_raw/income_event_raw";
import { parse_distribution, parse_start_condition } from "../raw/common";

import {
  parse_start_year,
  parse_duration,
  Event,
  parse_expected_annual_change,
} from "./Event";

export interface IncomeEvent extends Event, Cloneable<IncomeEvent> {
  initial_amount: number;
  change_type: ChangeType;
  expected_annual_change: ValueGenerator;
  inflation_adjusted: boolean;
  user_fraction: number;
  social_security: boolean;
  clone(): IncomeEvent;
}

function parse_user_fraction(user_fraction: number) {
  if (user_fraction > 1 || user_fraction < 0) {
    throw new Error(`invalid user fraction ${user_fraction}`);
  }
  return user_fraction;
}

function create_income_event(raw_data: IncomeEventRaw): IncomeEvent {
  try {
    const start = parse_start_year(raw_data.start);
    const duration = parse_duration(raw_data.duration);
    const [change_type, expected_annual_change] = parse_expected_annual_change(
      raw_data.changeAmtOrPct,
      raw_data.changeDistribution
    );
    const user_fraction = parse_user_fraction(raw_data.userFraction);
    return {
      name: raw_data.name,
      start,
      duration,
      type: raw_data.type,
      initial_amount: raw_data.initialAmount,
      change_type,
      expected_annual_change,
      inflation_adjusted: raw_data.inflationAdjusted,
      user_fraction,
      social_security: raw_data.socialSecurity,
      clone: () => create_income_event(raw_data)
    };
  } catch (error) {
    throw new Error(`Failed to initialize IncomeEvent: ${error}`);
  }
}

export default create_income_event;
