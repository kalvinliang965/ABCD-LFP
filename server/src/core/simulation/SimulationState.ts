import { start } from "repl";
import Scenario, { ScenarioReturnType } from "../domain/scenario/Scenario";
import { TaxFilingStatus } from "../Enums";

function SimulationState(
    scenario: ScenarioReturnType, 
) {
   
    const start_year: number = new Date().getFullYear();
    const current_year: number = start_year;
    const tax_filing_status = scenario.tax_filing_status;
    const inflation_assumption = scenario.inflation_assumption;
    let inflation_factor = inflation_assumption.sample();

    const adjust_for_inflation = () => {
        inflation_factor *= (1 + inflation_assumption.sample());
    }
    const user_age = () => {
        return current_year - scenario.user_birth_year
    }

    const user_year_of_death = () => {
        return (scenario.user_birth_year + scenario.user_life_expectancy) + 1;
    }

    const is_user_alive = () => {
        return current_year < user_year_of_death();
    }

    const spouse_age = () => {
       if (tax_filing_status !==  TaxFilingStatus.MARRIED) {
            throw new Error("spounse age: user is single");
       }
       return current_year - scenario.user_birth_year;
    }

    const spouse_year_of_death = () => {
       if (tax_filing_status !==  TaxFilingStatus.MARRIED) {
            throw new Error("spounse age: user is single");
       }
       return current_year - scenario.spouse_birth_year;
    }
    
    const is_spouse_alive = () => {
        if (tax_filing_status !==  TaxFilingStatus.MARRIED) {
            throw new Error("spounse age: user is single");
        }
        return current_year < spouse_year_of_death();
    }


    const roth_conversion_opt = scenario.roth_conversion_opt;
    const roth_conversion_start = scenario.roth_conversion_start;
    const roth_conversion_end = scenario.roth_conversion_end;
    const roth_conversion_strategy = scenario.roth_conversion_strategy;

    let taxable_income = 0;
    let capital_gains_income = 0;
    let social_security_income = 0;
    

    return {
        start_year,
        current_year,
        tax_filing_status,
        inflation_factor,
        roth_conversion_opt,
        roth_conversion_start,
        roth_conversion_end,
        roth_conversion_strategy,
        adjust_for_inflation,
        user_age,
        user_year_of_death,
        is_user_alive,
        spouse_age,
        spouse_year_of_death,
        is_spouse_alive,   
    }
}

export default SimulationState;