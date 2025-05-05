
import { create_tax_brackets, TaxBracket, TaxBrackets } from "./TaxBrackets";
import { create_standard_deductions, StandardDeduction } from "./StandardDeduction";
import { 
    fetch_and_parse_capital_gains, 
    fetch_and_parse_standard_deduction, 
    fetch_and_parse_taxable_income 
} from "../../services/FederalTaxScraper";
import { get_taxable_income_brackets, get_capital_gains_brackets } from "../../db/repositories/TaxBracketRepository";
import { get_standard_deduction_from_db } from "../../db/repositories/StandardDeductionRepository";
import { IncomeType, TaxFilingStatus } from "../Enums";
import { tax_config } from "../../config/tax";
 
import { simulation_logger } from "../../utils/logger/logger";

async function initialize_taxable_income_bracket(): Promise<TaxBrackets> {
    try {
        simulation_logger.debug("geting taxable income brackets from database...");
        const taxable_income_bracket_list = await get_taxable_income_brackets(); 
        if (taxable_income_bracket_list.length) {
            simulation_logger.debug("Successfully geted taxable income brackets from database");
            const gains = create_tax_brackets();
            taxable_income_bracket_list.forEach((ti) => {
                const { min, max, rate, income_type, taxpayer_type } = ti;
                if (income_type != IncomeType.TAXABLE_INCOME) {
                    simulation_logger.error(
                        "initialize_taxable_income_bracket() getded wrong data",
                        {
                            expect: IncomeType.TAXABLE_INCOME,
                            actual: income_type,
                            taxpayer_type,
                        }
                    );
                    process.exit(1);
                }
                gains.add_bracket(min, max, rate, taxpayer_type);
            })
            return gains;
        }
        simulation_logger.info("No local taxable income brackets found, fetching from remote API....");
        const gains = await fetch_and_parse_taxable_income(tax_config.FEDERAL_TAX_URL);
        simulation_logger.info("Successfully fetched taxable income brackets from remote API");
        return gains;
    } catch (error) {
        simulation_logger.error("Failed to initialize taxable income brackets", {
            error: error instanceof Error? error.stack: error
        });
        throw new Error(`Error in initializing taxable income bracket ${error}`);
    }
}

async function initialize_capital_gains_bracket(): Promise<TaxBrackets> {
    try {
        simulation_logger.debug("geting capital gains brackets from database...");
        const capital_gains_bracket_list = await get_capital_gains_brackets(); 
        if (capital_gains_bracket_list.length) {
            simulation_logger.debug("Successfully geted capital gains brackets from database");
            const gains = create_tax_brackets();
            capital_gains_bracket_list.forEach((cg) => {
                const { min, max, rate, income_type, taxpayer_type } = cg;
                if (income_type != IncomeType.CAPITAL_GAINS) {
                    simulation_logger.error(
                        "initialize_capital_gains_bracket() getded wrong data", {
                            expect: IncomeType.CAPITAL_GAINS,
                            actual: income_type,
                            taxpayer_type,
                        });
                    process.exit(1);
                }
                gains.add_bracket(min, max, rate, taxpayer_type);
            })
            return gains;
        }
        simulation_logger.info("No local capital gains brackets found, fetching from remote API...");
        const gains = await fetch_and_parse_capital_gains(tax_config.CAPITAL_GAINS_URL);
        simulation_logger.info("Successfully fetched capital gains brackets from remote API");
        return gains;
    } catch (error) {
        simulation_logger.error("Failed to initialize capital gains brackets", {
            error: error instanceof Error? error.stack: error,
        });
        throw new Error(`Error in initializing capital gains bracket ${error}`);
    }
}

async function initialize_standard_deductions_info(): Promise<StandardDeduction> {
    try {
        simulation_logger.debug("geting standard deduction info");
        const standard_deduction_list = await get_standard_deduction_from_db();
        if (standard_deduction_list.length > 0) {
            simulation_logger.debug("Successfully geted standard deduction info from database");
            const deductions = create_standard_deductions();
            standard_deduction_list.forEach((deduction) => {
                const { amount, taxpayer_type }  = deduction;
                deductions.add_deduction(amount, taxpayer_type);
            });
            return deductions;
        }
        simulation_logger.info("No local standard deduction info found, fetching from remote API....");
        const deductions = await fetch_and_parse_standard_deduction(tax_config.STD_DEDUCTION_URL);
        simulation_logger.info("Successfully fetched standard deduction info from remote API");
        return deductions;
    } catch (error) {
        simulation_logger.error("Failed to initialize capital gains brackets", {
            error: error instanceof Error? error.stack: error,
        });
        throw new Error("Error in initializing standard deductions info");
    }
}

export interface FederalTaxService {
    __taxable_income_bracket: TaxBrackets,
    __capital_gains_bracket: TaxBrackets,
    __standard_deductions: StandardDeduction
    get_prev_taxable_income_bracket: () => TaxBrackets | null,
    get_prev_capital_gains_bracket: () => TaxBrackets | null,
    get_prev_standard_deductions: () => StandardDeduction | null,
    print_taxable_income_bracket(): void;
    print_capital_gains_bracket(): void;
    print_standard_deductions_info(): void;
    adjust_for_inflation(rate: number): void;
    find_prev_bracket_with_rate(rate: number, income_type: IncomeType, status: TaxFilingStatus): TaxBracket;
    find_prev_bracket_with_income(income: number, income_type: IncomeType, status: TaxFilingStatus): TaxBracket;
    find_prev_rate(income: number, income_type: IncomeType, status: TaxFilingStatus): number;
    find_prev_deduction(status: TaxFilingStatus): number;
    find_bracket_with_rate(rate: number, income_type: IncomeType, status: TaxFilingStatus): TaxBracket;
    find_bracket_with_income(income: number, income_type: IncomeType, status: TaxFilingStatus): TaxBracket;
    find_rate(income: number, income_type: IncomeType, status: TaxFilingStatus): number;
    find_deduction(status: TaxFilingStatus): number;
    clone(): FederalTaxService,
}

export function create_federal_service_wo(
    taxable_income_bracket: TaxBrackets,
    capital_gains_bracket: TaxBrackets,
    standard_deductions: StandardDeduction
): FederalTaxService {

    // contain tax info from previous year
    let prev_taxable_income_bracket: TaxBrackets | null = null;
    let prev_capital_gains_bracket: TaxBrackets | null = null;
    let prev_standard_deductions: StandardDeduction | null = null;


    // these are for debugging purposes
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
        
        prev_taxable_income_bracket = taxable_income_bracket.clone();
        prev_capital_gains_bracket = capital_gains_bracket.clone();
        prev_standard_deductions = standard_deductions.clone();

        taxable_income_bracket.adjust_for_inflation(rate);
        capital_gains_bracket.adjust_for_inflation(rate);
        standard_deductions.adjust_for_inflation(rate);
    }

    // find bracket from previous year
    const find_prev_bracket_with_rate = (rate: number, income_type: IncomeType, status: TaxFilingStatus): TaxBracket => {
        if (
            prev_taxable_income_bracket == undefined ||
            prev_capital_gains_bracket == undefined || 
            prev_standard_deductions == undefined
        ) {
            simulation_logger.error("Retrieving previous data, but not avilable yet")
            throw new Error("Previous year data not available");
        }
        
        try {
            switch(income_type) {
                case IncomeType.CAPITAL_GAINS:
                    return prev_capital_gains_bracket.find_bracket_with_rate(rate, status);
                case IncomeType.TAXABLE_INCOME:
                    return prev_taxable_income_bracket.find_bracket_with_rate(rate, status);

                default:
                    throw new Error(`Failed to find bracket due to invalid income type ${income_type}`);
            } 
        } catch(error) {
            throw error;
        }
    }
    const find_prev_bracket_with_income = (income: number, income_type: IncomeType, status: TaxFilingStatus): TaxBracket => {
        if (
            prev_taxable_income_bracket == undefined ||
            prev_capital_gains_bracket == undefined || 
            prev_standard_deductions == undefined
        ) {
            simulation_logger.error("Retrieving previous data, but not avilable yet")
            throw new Error("Previous year data not available");
        }
        try {
            switch(income_type) {
                case IncomeType.CAPITAL_GAINS:
                    return prev_capital_gains_bracket.find_bracket_with_income(income, status);
                case IncomeType.TAXABLE_INCOME:
                    return prev_taxable_income_bracket.find_bracket_with_income(income, status);

                default:
                    throw new Error(`Failed to find bracket due to invalid income type ${income_type}`);
            } 
        } catch(error) {
            throw error;
        }
    }

    const find_prev_rate = (income: number, income_type: IncomeType, status: TaxFilingStatus): number => {
        if (
            prev_taxable_income_bracket == undefined ||
            prev_capital_gains_bracket == undefined || 
            prev_standard_deductions == undefined
        ) {
            simulation_logger.error("Retrieving previous data, but not avilable yet")
            throw new Error("Previous year data not available");
        }
        try {
            return find_prev_bracket_with_income(income, income_type, status).rate
        } catch (error) {
            throw new Error(`Failed to find income ${income} for ${income_type} and ${status} because ${error instanceof Error? error.message : error}`);
        }
    }

    const find_prev_deduction = (status: TaxFilingStatus): number => {
        if (
            prev_taxable_income_bracket == undefined ||
            prev_capital_gains_bracket == undefined || 
            prev_standard_deductions == undefined
        ) {
            simulation_logger.error("Retrieving previous data, but not avilable yet")
            throw new Error("Previous year data not available");
        }
        try {
            return prev_standard_deductions.find_deduction(status);
        } catch (error) {
            throw error;
        }
    }

    // find bracket for current year
    const find_bracket_with_rate = (rate: number, income_type: IncomeType, status: TaxFilingStatus): TaxBracket => {
        try {
            switch(income_type) {
                case IncomeType.CAPITAL_GAINS:
                    return capital_gains_bracket.find_bracket_with_rate(rate, status);
                case IncomeType.TAXABLE_INCOME:
                    return taxable_income_bracket.find_bracket_with_rate(rate, status);

                default:
                    throw new Error(`Failed to find bracket due to invalid income type ${income_type}`);
            } 
        } catch(error) {
            throw error;
        }
    }
    const find_bracket_with_income = (income: number, income_type: IncomeType, status: TaxFilingStatus): TaxBracket => {
        try {
            switch(income_type) {
                case IncomeType.CAPITAL_GAINS:
                    return capital_gains_bracket.find_bracket_with_income(income, status);
                case IncomeType.TAXABLE_INCOME:
                    return taxable_income_bracket.find_bracket_with_income(income, status);

                default:
                    throw new Error(`Failed to find bracket due to invalid income type ${income_type}`);
            } 
        } catch(error) {
            throw error;
        }
    }

    const find_rate = (income: number, income_type: IncomeType, status: TaxFilingStatus): number => {
        try {
            return find_bracket_with_income(income, income_type, status).rate
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

        __taxable_income_bracket: taxable_income_bracket,
        __capital_gains_bracket: capital_gains_bracket,
        __standard_deductions: standard_deductions,

        get_prev_taxable_income_bracket: () => prev_taxable_income_bracket,
        get_prev_capital_gains_bracket: () => prev_capital_gains_bracket,
        get_prev_standard_deductions: () => prev_standard_deductions,
        print_taxable_income_bracket,
        print_capital_gains_bracket,
        print_standard_deductions_info,
        adjust_for_inflation,
        find_prev_bracket_with_income,
        find_prev_bracket_with_rate,
        find_prev_rate,
        find_prev_deduction,
        find_bracket_with_rate,
        find_bracket_with_income,
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
        simulation_logger.debug("Initializing federal tax data...");
        
        simulation_logger.debug("scraping taxable income bracket...");
        const taxable_income_bracket = await initialize_taxable_income_bracket();

        simulation_logger.debug("scraping capital gains bracket..");
        const capital_gains_bracket = await initialize_capital_gains_bracket();

        simulation_logger.debug("scraping standard deduction...");
        const standard_deductions = await initialize_standard_deductions_info();
        return create_federal_service_wo(taxable_income_bracket, capital_gains_bracket, standard_deductions);
    } catch (error) {
        console.error(`Error in initializing federal tax data: ${error}`);
        process.exit(1);
    }
}

