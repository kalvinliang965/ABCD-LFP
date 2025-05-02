import { Cloneable } from "../../../utils/CloneUtil";
import  { ValueGenerator, ValueSource } from "../../../utils/ValueGenerator";
import { ChangeType, DistributionType, StatisticType } from "../../Enums";
import { Distribution, parse_distribution, parse_start_condition, StartCondition } from "../raw/common";
import { EventRaw } from "../raw/event_raw/event_raw";
import { ExpenseEvent } from "./ExpenseEvent";
import { IncomeEvent } from "./IncomeEvent";
import { InvestEvent } from "./InvestEvent";
import { RebalanceEvent } from "./RebalanceEvent";

export function parse_duration(distribution: Distribution, value_source: ValueSource): number {
  return parse_distribution(distribution, value_source).sample();
}

export function parse_start_year(start_condition: StartCondition, value_source: ValueSource): number {
  return parse_start_condition(start_condition, value_source).sample()
}

export function parse_expected_annual_change(
  changeAmtOrPct: string,
  distribution: Distribution,
  value_source: ValueSource, 
): [ChangeType, ValueGenerator] {
  function parse_change_amt_or_pct(): ChangeType {
    switch (changeAmtOrPct) {
      case "amount":
        return ChangeType.AMOUNT;
      case "percent":
        return ChangeType.PERCENT;
      default:
        throw new Error("Invalid changeAmtOrPct");
    }
  }

  try {
    const change_type: ChangeType = parse_change_amt_or_pct();
    const change_distribution: ValueGenerator = parse_distribution(distribution, value_source);
    return [change_type, change_distribution];
  } catch (error) {
    throw error;
  }
}

export interface Event extends Cloneable<Event> {
  name: string;
  start: number;
  duration: number;
  type: string;
  clone(): Event;
}

export type EventUnion = IncomeEvent | ExpenseEvent | InvestEvent | RebalanceEvent;

