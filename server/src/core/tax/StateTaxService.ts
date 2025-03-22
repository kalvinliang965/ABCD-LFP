import { create_tax_brackets } from "./TaxBrackets";

export interface StateTaxService {
    load_state_tax_data(): void;
    adjust_for_inflation(rate: number): void;
}

export async function create_state_tax_service() {
    
    try {
        const taxable_income_bracket = create_tax_brackets()
        const load_state_tax_data = () => {
            // TODO
        }
        const adjust_for_inflation = (rate: number) => {
            taxable_income_bracket.adjust_for_inflation(rate);
        }


        return {
            load_state_tax_data,
            adjust_for_inflation
        }
    } catch(error) {
        throw new Error(`Error failed to initialize State tax data: ${error}`);
    }
}
