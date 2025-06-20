import { StateType, TaxFilingStatus } from "../Enums";
import { create_tax_brackets } from "./TaxBrackets";
import { TaxBrackets, TaxBracket } from "./TaxBrackets";
import { get_state_taxbrackets_by_state, create_state_taxbracket_in_db, state_taxbrackets_exist_in_db } from "../../db/repositories/StateTaxBracketRepository";
import { simulation_logger } from "../../utils/logger/logger";
import { prev } from "cheerio/lib/api/traversing";

export interface StateTaxService {
    __taxable_income_brackets: TaxBrackets;
    get_prev_taxable_income_bracket: () => TaxBrackets | null;
    adjust_for_inflation(rate: number): void;
    find_prev_rate(income: number, status: TaxFilingStatus): number;
    find_prev_bracket_with_rate(rate: number, status: TaxFilingStatus): TaxBracket;
    find_prev_bracket_with_income(income: number, status: TaxFilingStatus): TaxBracket;
    find_rate(income: number, status: TaxFilingStatus): number;
    find_bracket_with_rate(rate: number, status: TaxFilingStatus): TaxBracket;
    find_bracket_with_income(income: number, status: TaxFilingStatus): TaxBracket;
    clone(): StateTaxService;
}

export function create_state_tax_service_wo(
    taxable_income_bracket: TaxBrackets
): StateTaxService {
    let prev_taxable_income_bracket: TaxBrackets | null = null;

    const adjust_for_inflation = (rate: number) => {
        
        prev_taxable_income_bracket = taxable_income_bracket.clone();

        taxable_income_bracket.adjust_for_inflation(rate);
    }

    const find_prev_bracket_with_income = (income: number, status: TaxFilingStatus): TaxBracket => {
        if (
            prev_taxable_income_bracket == undefined
        ) {
            simulation_logger.error("Retrieving previous data, but not avilable yet")
            throw new Error("Previous year data not available");
        }
        try {
            return prev_taxable_income_bracket.find_bracket_with_income(income, status);
        } catch(error) {
            throw error;
        }
    }
    const find_prev_bracket_with_rate = (rate: number, status: TaxFilingStatus): TaxBracket => {
        if (
            prev_taxable_income_bracket == undefined
        ) {
            simulation_logger.error("Retrieving previous data, but not avilable yet")
            throw new Error("Previous year data not available");
        }
        try {
            return prev_taxable_income_bracket.find_bracket_with_rate(rate, status);
        } catch(error) {
            throw error;
        }
    }
    const find_prev_rate = (income: number, status: TaxFilingStatus): number => {
        if (
            prev_taxable_income_bracket == undefined
        ) {
            simulation_logger.error("Retrieving previous data, but not avilable yet")
            throw new Error("Previous year data not available");
        }
        try {
            return prev_taxable_income_bracket.find_rate(income, status);
        } catch (error) {
            throw new Error(`Failed to find rate for income ${income} and ${status} because ${error instanceof Error? error.message : error}`);
        }
    }
    const find_rate = (income: number, status: TaxFilingStatus): number => {
        try {
            return taxable_income_bracket.find_rate(income, status);
        } catch (error) {
            throw new Error(`Failed to find rate for income ${income} and ${status} because ${error instanceof Error? error.message : error}`);
        }
    }
    const find_bracket_with_rate = (rate: number, status: TaxFilingStatus): TaxBracket => {
        try {
            return taxable_income_bracket.find_bracket_with_rate(rate, status);
        } catch(error) {
            throw error;
        }
    }
    const find_bracket_with_income = (income: number, status: TaxFilingStatus): TaxBracket => {
        try {
            return taxable_income_bracket.find_bracket_with_income(income, status);
        } catch(error) {
            throw error;
        }
    }
    return {
        __taxable_income_brackets: taxable_income_bracket,
        get_prev_taxable_income_bracket: () => prev_taxable_income_bracket,
        adjust_for_inflation,
        find_prev_rate,
        find_prev_bracket_with_rate,
        find_prev_bracket_with_income,
        find_rate,
        find_bracket_with_rate,
        find_bracket_with_income,
        clone: () => create_state_tax_service_wo(taxable_income_bracket.clone())
    }
}

// /**
//  * ! This function shouldn't be use anymore. our program assume yaml is parse in front end.
//  * @param resident_state 
//  * @param yaml_string 
//  * @returns 
//  */
// export async function create_state_tax_service_yaml(resident_state: StateType , yaml_string: string) {
//     try {
//         const taxable_income_bracket = create_tax_brackets()
//         const brackets: Array<StateTaxYAML> = create_state_tax_raw_yaml(yaml_string);
//         if (brackets.length <= 0) {
//             throw new Error("state.yaml is empty");
//         }
//         for (const bracket of brackets) {
//             if (resident_state != bracket.resident_state) {
//                 throw new Error("YAML file resident state does not match with user's state");
//             }
//             taxable_income_bracket.add_bracket(bracket.min, bracket.max, bracket.rate, bracket.taxpayer_type);
//             await create_state_taxbracket_in_db(bracket.min, bracket.max, bracket.rate, bracket.taxpayer_type, resident_state);
//         }
//         return create_state_tax_service_wo(taxable_income_bracket);
//     } catch(error) {
//         throw new Error(`Failed to initialize State tax data: ${error}`);
//     }
// }

export async function create_state_tax_service(entered_resident_state: StateType): Promise<StateTaxService> {
    try {
        const taxable_income_bracket = create_tax_brackets()
        if (!await state_taxbrackets_exist_in_db(entered_resident_state)) {
            // no state tax
            taxable_income_bracket.add_bracket(0, Infinity, 0, TaxFilingStatus.INDIVIDUAL);
            taxable_income_bracket.add_bracket(0, Infinity, 0, TaxFilingStatus.COUPLE);
        } else {
            const tax_bracket_list = await get_state_taxbrackets_by_state(entered_resident_state);
            let has_couple = false;
            let has_individual = false;
            tax_bracket_list.forEach((ti) => {
                const { min, max, rate, taxpayer_type, resident_state } = ti;
                if (taxpayer_type === TaxFilingStatus.INDIVIDUAL) {
                    has_individual = true;
                } 
                if (taxpayer_type === TaxFilingStatus.COUPLE) {
                    has_couple = true;
                }
                if (resident_state != entered_resident_state) {
                    simulation_logger.error("load_state_taxable_income_brackets() loadded wrong data");
                    process.exit(1);
                }
                taxable_income_bracket.add_bracket(min, max, rate, taxpayer_type);
            });
            if (!has_individual) {
                simulation_logger.error(`Database data incomplete. Does not contain state tax of individual taxpayer`);
                throw new Error(`Database data incomplete. Does not contain state tax of individual taxpayer`);
            }
            if (!has_couple) {
                simulation_logger.error(`Database data incomplete. Does not contain state tax of couple taxpayer`);
                throw new Error(`Database data incomplete. Does not contain state tax of couple taxpayer`);
            }
        }
        return create_state_tax_service_wo(taxable_income_bracket);
    } catch(error) {
        console.error(error instanceof Error? error.message: error);
        throw new Error(`Error failed to initialize State tax data: ${error}`);
    }
}
