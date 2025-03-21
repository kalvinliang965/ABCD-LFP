
import { TaxBrackets, TaxBracketsObject } from "../TaxBrackets";
import { StandardDeductions, StandardDeductionObject } from "../StandardDeduction";
import { parse_standard_deductions, parse_capital_gains, parse_taxable_income } from "../../../services/scrapping/FederalTaxScraper";
// we assume if one bracket exist, then we have store the entire table
function is_taxable_income_bracket_exist(): boolean {
    return false;
}

function is_capital_gains_bracket_exist(): boolean {
    return false;
}

function is_std_deduction_exist(): boolean {
    return false;
}



async function initialize_taxable_income_bracket(): Promise<TaxBracketsObject> {

    try {

        if (is_taxable_income_bracket_exist()) {
            // TODO
            const taxBracket = TaxBrackets();
        
            // fetch the data

            // add it to res
            return taxBracket;       
        } else {
            const taxBracket = await parse_taxable_income();

            
            // store it to database
            return taxBracket
        }
    } catch (error) {
        throw new Error("Error in intitializing the taxable income bracket");
    }

}

function initialize_capital_gains_bracket(): TaxBracketsObject | undefined {

    if (is_capital_gains_bracket_exist()) {

    }
    return undefined;
}

function initialize_standard_deductions(): StandardDeductionObject | undefined {
    if (is_std_deduction_exist()) {
    }

    return undefined;
}
function FederalTaxData() {

    try {
        
        const taxable_income_bracket = initialize_taxable_income_bracket();
        const capital_gains_bracket = initialize_capital_gains_bracket();
        const standard_deductions = initialize_standard_deductions();
    
    
    } catch (error) {
        console.error("Error in initializing federal tax data");
        process.exit(1);
    }
}


export default FederalTaxData;