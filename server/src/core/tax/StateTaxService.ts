import { TaxBrackets } from "./TaxBrackets";

export interface StateTaxServiceObject {
    load_state_tax_data(): void;
    adjust_for_inflation(rate: number): void;
}

async function StateTaxService() {
    
    try {
        const taxable_income_bracket = TaxBrackets()
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

export default StateTaxService;