import { TaxFilingStatus } from "../Enums";
import { create_tax_brackets } from "./TaxBrackets";

export interface StateTaxService {
    load_state_tax_data(): void;
    adjust_for_inflation(rate: number): void;
    find_rate(income: number, status: TaxFilingStatus): number;
}

export async function create_state_tax_service(): Promise<StateTaxService> {
    
    try {
        const taxable_income_bracket = create_tax_brackets()
        const load_state_tax_data = () => {
            // TODO
        }
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

        return {
            load_state_tax_data,
            adjust_for_inflation,
            find_rate,
        }
    } catch(error) {
        throw new Error(`Error failed to initialize State tax data: ${error}`);
    }
}
