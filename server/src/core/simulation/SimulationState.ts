import { Investment } from "../domain/investment/Investment";
import { Scenario } from "../domain/scenario/Scenario";
import { TaxFilingStatus, TaxStatus } from "../Enums";
import { FederalTaxService, create_federal_tax_service } from "../tax/FederalTaxService";
import { StateTaxService, create_state_tax_service } from "../tax/StateTaxService";


export type AccountMap = Map<string, Investment>;

export interface PersonDetails {
    get_age(): number;
    year_of_death: number,
    is_alive(): boolean;
}

export interface SimulationState {
    investments: Array<Investment>
    tax_filing_status: TaxFilingStatus;
    inflation_factor: number;
    roth_conversion_opt: boolean;
    roth_conversion_start: number;
    roth_conversion_end: number;
    roth_conversion_strategy: Array<string>;
    user: PersonDetails;
    spouse?: PersonDetails;
    get_taxable_income(): number;
    get_capital_gains_income(): number;
    get_social_security_income(): number;
    incr_taxable_income(amt: number): void;
    incr_capital_gains_income(amt: number): void;
    incr_social_security_income(amt: number): void;
    setup_year(): void;
    get_current_year(): number;
    federal_tax_service: FederalTaxService,
    state_tax_service: StateTaxService,
    advance_year(): void,
    accounts: {
        non_retirement: AccountMap;
        pre_tax: AccountMap;
        after_tax: AccountMap;
    }
}

// return [non-retirment, pre-tax, after-tax] investment
const parse_investments = (investments: Investment[]): [AccountMap, AccountMap, AccountMap] => {
    const non_retirement_account = new Map<string, Investment>();
    const pre_tax_account = new Map<string, Investment>();
    const after_tax_account = new Map<string, Investment>(); 

    for (const investment of investments) {
        switch(investment.taxStatus) {
            case TaxStatus.NON_RETIREMENT:
                non_retirement_account.set(investment.id, investment);
                break;    
            case TaxStatus.PRE_TAX:
                pre_tax_account.set(investment.id, investment);
                break;
            case TaxStatus.AFTER_TAX:
                after_tax_account.set(investment.id, investment);
                break;
            default:
                throw new Error(`Invalid tax status: ${investment.taxStatus}`);
        }
    }
    return [non_retirement_account, pre_tax_account, after_tax_account]
}


const create_person_details = (birth_year: number, life_expectancy: number, get_current_year: () => number): PersonDetails => ({
    get_age: () => get_current_year() - birth_year,
    year_of_death: birth_year + life_expectancy + 1,
    is_alive: () => get_current_year() < birth_year + life_expectancy + 1,
})

export async function create_simulation_state(
    scenario: Scenario, 
): Promise<SimulationState> {
    try { 
        const start_year: number = new Date().getFullYear();
        let current_year: number = start_year;
        const is_married = scenario.tax_filing_status;
        
        
        // same as ordinary income, but because bracket use taxable we will also use it 
        let taxable_income = 0;
        let capital_gains_income = 0;
        let social_security_income = 0;


        const [non_retirement, pre_tax, after_tax] = parse_investments(scenario.investments);

        let inflation_factor = scenario.inflation_assumption.sample();

        const federal_tax_service = await create_federal_tax_service();
        const state_tax_service = await create_state_tax_service();

        const user = create_person_details(scenario.user_birth_year, scenario.user_life_expectancy, () => current_year);

        const spouse = is_married
        ? create_person_details(scenario.spouse_birth_year!, scenario.spouse_life_expectancy!, () => current_year)
        : undefined;
        return {
            investments: scenario.investments,
            tax_filing_status: scenario.tax_filing_status,
            inflation_factor,
            roth_conversion_opt: scenario.roth_conversion_opt,
            roth_conversion_start: scenario.roth_conversion_start,
            roth_conversion_end: scenario.roth_conversion_end,
            roth_conversion_strategy: scenario.roth_conversion_strategy,
            user,
            spouse,

            get_taxable_income: () => taxable_income,
            get_capital_gains_income: () => capital_gains_income,
            get_social_security_income: () => social_security_income,
            incr_taxable_income: (amt: number) => taxable_income += amt,
            incr_capital_gains_income: (amt: number) => capital_gains_income += amt,
            incr_social_security_income: (amt: number) => social_security_income += amt,
            
            setup_year: () => {
                taxable_income = capital_gains_income = social_security_income = 0;
                federal_tax_service.adjust_for_inflation(inflation_factor);
                state_tax_service.adjust_for_inflation(inflation_factor);
            },

            get_current_year: () => current_year,
            federal_tax_service,
            state_tax_service,
            
            advance_year: () => {
                current_year++;
                inflation_factor *= (1 + scenario.inflation_assumption.sample());
            },
            accounts: {
                non_retirement,
                pre_tax,
                after_tax,
            }
        }
    } catch (error) {
        throw new Error(`Simulation initialization failed: ${error instanceof Error ? error.message: error}`);
    }
}
