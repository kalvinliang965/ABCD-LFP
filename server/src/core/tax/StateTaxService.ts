import { create_state_tax__raw_yaml, StateTaxYAML } from "../../services/StateYamlParser";
import { StateType, TaxFilingStatus } from "../Enums";
import { create_tax_brackets, TaxBracketSet } from "./TaxBrackets";
import { TaxBrackets, TaxBracket } from "./TaxBrackets";
import { load_state_taxable_income_brackets, save_state_tax_bracket, has_state_data } from "../../db/repositories/StateTaxBracketRepository";

export interface StateTaxService {
    adjust_for_inflation(rate: number): void;
    find_rate(income: number, status: TaxFilingStatus): number;
    find_bracket(rate: number, status: TaxFilingStatus): TaxBracket;
    clone(): StateTaxService;
}

export function create_state_tax_service_wo(taxable_income_bracket: TaxBrackets): StateTaxService {
        const adjust_for_inflation = (rate: number) => {
            taxable_income_bracket.adjust_for_inflation(rate);
        }
        const find_rate = (income: number, status: TaxFilingStatus): number => {
            try {
                return taxable_income_bracket.find_rate(income, status);
            } catch (error) {
                throw new Error(`Failed to find rate for income ${income} and ${status} because ${error instanceof Error? error.message : error}`);
            }
        }
        const find_bracket = (rate: number, status: TaxFilingStatus): TaxBracket => {
            try {
                return taxable_income_bracket.find_bracket(rate, status);
            } catch(error) {
                throw error;
            }
        }
        return {
            adjust_for_inflation,
            find_rate,
            find_bracket,
            clone: () => create_state_tax_service_wo(taxable_income_bracket.clone())
        }
}

export async function create_state_tax_service_yaml(resident_state: StateType , yaml_string: string) {
    try {
        const taxable_income_bracket = create_tax_brackets()
        const brackets: Array<StateTaxYAML> = create_state_tax__raw_yaml(yaml_string);
        if (brackets.length <= 0) {
            throw new Error("state.yaml is empty");
        }
        for (const bracket of brackets) {
            if (resident_state != bracket.resident_state) {
                throw new Error("YAML file resident state does not match with user's state");
            }
            taxable_income_bracket.add_bracket(bracket.min, bracket.max, bracket.rate, bracket.taxpayer_type);
            await save_state_tax_bracket(bracket.min, bracket.max, bracket.rate, bracket.taxpayer_type, resident_state);
        }
        return create_state_tax_service_wo(taxable_income_bracket);
    } catch(error) {
        throw new Error(`Failed to initialize State tax data: ${error}`);
    }
}

export async function create_state_tax_service_db(entered_resident_state: StateType): Promise<StateTaxService> {
    try {
        const taxable_income_bracket = create_tax_brackets()
        if (!await has_state_data(entered_resident_state)) {
            throw new Error(`DB does not contain data for ${entered_resident_state}`);
        } else {
            console.log("TEST");
            const tax_bracket_list = await load_state_taxable_income_brackets(entered_resident_state);
            tax_bracket_list.forEach((ti) => {
                const { min, max, rate, taxpayer_type, resident_state } = ti;
                if (resident_state != entered_resident_state) {
                    console.error("load_state_taxable_income_brackets() loadded wrong data");
                    process.exit(1);
                }
                taxable_income_bracket.add_bracket(min, max, rate, taxpayer_type);
            });
        }
        return create_state_tax_service_wo(taxable_income_bracket);
    } catch(error) {
        console.error(error instanceof Error? error.message: error);
        throw new Error(`Error failed to initialize State tax data: ${error}`);
    }
}
