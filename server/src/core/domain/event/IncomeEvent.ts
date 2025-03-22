import { ChangeType } from "../../Enums";
import { IncomeEventRaw } from "../scenario/Scenario";
import { EventObject, parse_duration, parse_start_year, parse_expected_annual_change } from "./Event";

interface IncomeEventObject extends EventObject{
    initial_amount: number;
    change_type: ChangeType;
    expected_annual_change: number;
    inflation_adjusted: boolean;
    user_fraction: number;
    social_security: boolean;
}

function parse_user_fraction(user_fraction: number) {
    if (user_fraction > 1 || user_fraction < 0) {
        throw new Error(`invalid user fraction ${user_fraction}`);
    }
    return user_fraction;
}

function IncomeEvent(raw_data: IncomeEventRaw): IncomeEventObject {
    try {
        const start = parse_start_year(raw_data.start);
        const duration = parse_duration(raw_data.duration);
        const [change_type, expected_annual_change] = parse_expected_annual_change(raw_data.changeAmtOrPct, raw_data.changeDistribution);
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
        }
    }  catch (error) {
        throw new Error(`Failed to initialize IncomeEvent: ${error}`);
    }
}

export default IncomeEvent;