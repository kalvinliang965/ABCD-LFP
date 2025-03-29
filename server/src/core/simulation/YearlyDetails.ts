import { start } from "repl";
import { TaxFilingStatus } from "../Enums";
import { YearlyRecords } from "./YearlyTaxRecords";
import { RandomGenerator } from "../../utils/math/ValueGenerator";


export interface YearlyDetails {
    advance(): void;
    get_tax_filing_status(): TaxFilingStatus;
    get_current_year(): number;
    get_inflation_factor(): number;
    get_inflation_factor(): number;
}

export const create_yearly_details = (
    start_year: number,
    tax_status: TaxFilingStatus,
    inflation_assumption: RandomGenerator,
    spouse_year_of_death?: number,
): YearlyDetails => {

    let current_year = start_year;
    let inflation_factor = inflation_assumption.sample();

    return {
        advance: () => {
            if (spouse_year_of_death && current_year == spouse_year_of_death) {
                tax_status = TaxFilingStatus.SINGLE;
            }
            current_year++;
            inflation_factor = inflation_assumption.sample();
        },

        get_tax_filing_status: () => {
            return tax_status;
        },

        get_inflation_factor: () => {
            return inflation_factor;
        },
        get_current_year: () => current_year,
    }

}