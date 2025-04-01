import { RandomGenerator } from "../../../utils/math/ValueGenerator";
import { ChangeType } from "../../Enums";
import { ExpenseEventRaw } from "../scenario/Scenario";
import {
  Event,
  parse_duration,
  parse_start_year,
  parse_expected_annual_change,
} from "./Event";

export interface ExpenseEvent extends Event {
  initial_amount: number;
  change_type: ChangeType;
  expected_annual_change: RandomGenerator;
  inflation_adjusted: boolean;
  user_fraction: number;
  discretionary: boolean;
}

function parse_user_fraction(user_fraction: number) {
  if (user_fraction > 1 || user_fraction < 0) {
    throw new Error(`Invalid user fraction ${user_fraction}`);
  }
  return user_fraction;
}

function create_expense_event(raw_data: ExpenseEventRaw): ExpenseEvent {
  try {
    //打印正在处理的event的name

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
      discretionary: raw_data.discretionary,
    };
  } catch (error) {
    throw new Error(`Failed to initialize ExpenseEvent: ${error}`);
  }
}

export default create_expense_event;
