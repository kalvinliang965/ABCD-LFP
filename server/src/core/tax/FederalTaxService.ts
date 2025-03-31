
import { create_tax_brackets, TaxBracket, TaxBrackets } from "./TaxBrackets";
import { create_standard_deductions, StandardDeduction } from "./StandardDeduction";
import { 
    fetch_and_parse_capital_gains, 
    fetch_and_parse_standard_deduction, 
    fetch_and_parse_taxable_income 
} from "../../services/FederalTaxScraper";
import { load_capital_gains_brackets, load_taxable_income_brackets } from "../../db/repositories/TaxBracketRepository";
import { load_standard_deduction } from "../../db/repositories/StandardDeductionRepository";
import { IncomeType, TaxFilingStatus } from "../Enums";
import { tax_config } from "../../config/tax";
    
async function initialize_taxable_income_bracket(): Promise<TaxBrackets> {
    try {
        const taxable_income_bracket_list = await load_taxable_income_brackets(); 
        if (taxable_income_bracket_list.length) {
            const gains = create_tax_brackets();
            taxable_income_bracket_list.forEach((ti) => {
                const { min, max, rate, income_type, taxpayer_type } = ti;
                if (income_type != IncomeType.TAXABLE_INCOME) {
                    console.error("initialize_taxable_income_bracket() loadded wrong data");
                    process.exit(1);
                }
                gains.add_rate(min, max, rate, taxpayer_type);
            })
            return gains;
        }
        const gains = await fetch_and_parse_taxable_income(tax_config.CAPITAL_GAINS_URL);
        return gains;
    } catch (error) {
        throw new Error("Error in initializing capital gains bracket");
    }
}

async function initialize_capital_gains_bracket(): Promise<TaxBrackets> {
    try {
        const capital_gains_bracket_list = await load_capital_gains_brackets(); 
        if (capital_gains_bracket_list.length) {
            const gains = create_tax_brackets();
            capital_gains_bracket_list.forEach((cg) => {
                const { min, max, rate, income_type, taxpayer_type } = cg;
                if (income_type != IncomeType.CAPITAL_GAINS) {
                    console.error("initialize_capital_gains_bracket() loadded wrong data");
                    process.exit(1);
                }
                gains.add_rate(min, max, rate, taxpayer_type);
            })
            return gains;
        }
        const gains = await fetch_and_parse_capital_gains(tax_config.CAPITAL_GAINS_URL);
        return gains;
    } catch (error) {
        throw new Error("Error in initializing capital gains bracket");
    }
}

async function initialize_standard_deductions_info(): Promise<StandardDeduction> {
    try {
        const standard_deduction_list = await load_standard_deduction();
        if (standard_deduction_list.length > 0) {
            const deductions = create_standard_deductions();
            standard_deduction_list.forEach((deduction) => {
                const { amount, taxpayer_type }  = deduction;
                deductions.add_deduction(amount, taxpayer_type);
            });
            return deductions;
        }
        //console.log("standard deduction is not in database");
        const deductions = await fetch_and_parse_standard_deduction(tax_config.STD_DEDUCTION_URL);
        return deductions;
    } catch (error) {
        throw new Error("Error in initializing standard deductions info");
    }
}

export interface FederalTaxService {
    print_taxable_income_bracket(): void;
    print_capital_gains_bracket(): void;
    print_standard_deductions_info(): void;
    adjust_for_inflation(rate: number): void;
    find_bracket(rate: number, income_type: IncomeType, status: TaxFilingStatus): TaxBracket;
    find_rate(income: number, income_type: IncomeType, status: TaxFilingStatus): number;
    find_deduction(status: TaxFilingStatus): number;
    clone(): FederalTaxService,
}

export function create_federal_service_wo(
    taxable_income_bracket: TaxBrackets,
    capital_gains_bracket: TaxBrackets,
    standard_deductions: StandardDeduction
): FederalTaxService {

        //console.log("Federal Tax data successfully initialize");
        const print_taxable_income_bracket = () =>  {
            console.log("TAXABLE INCOME BRACKETS!!!");
            console.log(taxable_income_bracket.to_string());
        }
        const print_capital_gains_bracket = () => {
            console.log("CAPITAL GAINS BRACKETS");
            console.log(capital_gains_bracket.to_string());
        }

        const print_standard_deductions_info = () => {
            console.log("STANDARD DEDUCTION INFO");
            console.log(standard_deductions.to_string());
        }

        const adjust_for_inflation = (rate: number) => {
            taxable_income_bracket.adjust_for_inflation(rate);
            capital_gains_bracket.adjust_for_inflation(rate);
            standard_deductions.adjust_for_inflation(rate);
        }

        const find_bracket = (rate: number, income_type: IncomeType, status: TaxFilingStatus): TaxBracket => {
            try {
                switch(income_type) {
                    case IncomeType.CAPITAL_GAINS:
                        return capital_gains_bracket.find_bracket(rate, status);
                    case IncomeType.TAXABLE_INCOME:
                        return taxable_income_bracket.find_bracket(rate, status);

                    default:
                        throw new Error(`Failed to find bracket due to invalid income type ${income_type}`);
                } 
            } catch(error) {
                throw error;
            }
        }

        const find_rate = (income: number, income_type: IncomeType, status: TaxFilingStatus): number => {
            try {
                switch(income_type) {
                    case IncomeType.CAPITAL_GAINS:
                        return capital_gains_bracket.find_rate(income, status);
                    case IncomeType.TAXABLE_INCOME:
                        return taxable_income_bracket.find_rate(income, status);
                    default:
                        throw new Error(`find_rate() invalid income type: ${income_type}`);
                }
            } catch (error) {
                throw new Error(`Failed to find income ${income} for ${income_type} and ${status} because ${error instanceof Error? error.message : error}`);
            }
        }

        const find_deduction = (status: TaxFilingStatus): number => {
            try {
                return standard_deductions.find_deduction(status);
            } catch (error) {
                throw error;
            }
        }
        return {
            print_taxable_income_bracket,
            print_capital_gains_bracket,
            print_standard_deductions_info,
            adjust_for_inflation,
            find_bracket,
            find_rate,
            find_deduction,
            clone: () => create_federal_service_wo(
                taxable_income_bracket.clone(),
                capital_gains_bracket.clone(),
                standard_deductions.clone(),
            )
        };
}

export async function create_federal_tax_service() : Promise<FederalTaxService> {
    try {        
        const taxable_income_bracket = await initialize_taxable_income_bracket();
        const capital_gains_bracket = await initialize_capital_gains_bracket();
        const standard_deductions = await initialize_standard_deductions_info();
        return create_federal_service_wo(taxable_income_bracket, capital_gains_bracket, standard_deductions);
    } catch (error) {
        console.error(`Error in initializing federal tax data: ${error}`);
        process.exit(1);
    }
}

