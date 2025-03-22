import { ScenarioReturnType } from "../domain/scenario/Scenario";
import { TaxFilingStatus } from "../Enums";
import FederalTaxService from "../tax/FederalTaxService";
import StateTaxService from "../tax/StateTaxService";

async function SimulationState(
    scenario: ScenarioReturnType, 
) {
    try {
        // user accumulated cash
        const cash_balance = 0;
        
        const start_year: number = new Date().getFullYear();
        let current_year: number = start_year;
        const tax_filing_status = scenario.tax_filing_status;
        const inflation_assumption = scenario.inflation_assumption;
        let inflation_factor = inflation_assumption.sample();

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

        // same as ordinary income, but because bracket use taxable we will also use it 
        let taxable_income = 0;
        const incr_taxable_income = (amt: number) => {
            taxable_income += amt;
        }
        let capital_gains_income = 0;
        const incr_capital_gains_income = (amt: number) => {
            capital_gains_income += amt;
        }   
        let social_security_income = 0;
        const incr_social_security_income = (amt: number) => {
            social_security_income += amt;
        }

        const federal_tax_service = await FederalTaxService();
        const state_tax_service = await StateTaxService();
        
        const advance_year = () => {
            current_year += 1
            inflation_factor *= (1 + inflation_assumption.sample());
        }

        const setup_year = () => {
            // clear accumulated income
            taxable_income = 0;
            capital_gains_income = 0;
            social_security_income = 0;
            // adjust for inflation
            federal_tax_service.adjust_for_inflation(inflation_factor);
            state_tax_service.adjust_for_inflation(inflation_factor);
        }

        const process_tax = () => {

        }

        return {
            tax_filing_status,
            inflation_factor,
            roth_conversion_opt,
            roth_conversion_start,
            roth_conversion_end,
            roth_conversion_strategy,
            user_age,
            user_year_of_death,
            is_user_alive,
            spouse_age,
            spouse_year_of_death,
            is_spouse_alive,   
            incr_taxable_income,
            incr_capital_gains_income,
            incr_social_security_income,
            setup_year,
            federalTaxService: federal_tax_service,
            stateTaxService: state_tax_service,
            advance_year,
        }
    } catch (error) {
        throw new Error(`Failed to initialize simulation state: ${error}`);
    }
}

export default SimulationState;