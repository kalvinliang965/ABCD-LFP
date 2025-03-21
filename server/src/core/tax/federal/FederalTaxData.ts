
import { TaxBrackets, TaxBracketsObject } from "../TaxBrackets";
import { StandardDeductions, StandardDeductionObject } from "../StandardDeduction";
import { parse_standard_deductions, parse_capital_gains, parse_taxable_income } from "../../../services/scrapping/FederalTaxScraper";
import { check_capital_gains, check_taxable_income, load_brackets } from "../../../db/repositories/TaxBracketRepository";
import { check_standard_deduction } from "../../../db/repositories/StandardDeductionRepository";
import { IncomeType } from "../../Enums";


async function initialize_taxable_income_bracket(): Promise<TaxBracketsObject> {
    try {
        if (await check_taxable_income()) {
            console.log("TEST1");
            const taxBracket = await load_brackets(IncomeType.TAXABLE_INCOME);
            return taxBracket;       
        }
        const taxBracket = await parse_taxable_income();
        return taxBracket
    } catch (error) {
        throw new Error("Error in intitializing the taxable income bracket");
    }

}

async function initialize_capital_gains_bracket(): Promise<TaxBracketsObject> {

    try {
        if (await check_capital_gains()) {
            console.log("TEST2");
            const taxBracket = await load_brackets(IncomeType.CAPITAL_GAINS);
            return taxBracket;
        }
        const taxBracket = await parse_capital_gains();
        return taxBracket;
    } catch (error) {
        throw new Error("Error in initializing capital gains bracket");
    }
}

async function initialize_standard_deductions_info(): Promise<StandardDeductionObject> {
    try {
        if (check_standard_deduction()) {
            console.log("TODO");
            process.exit(1);
        }
        const deductions = await parse_standard_deductions();
        return deductions;
    } catch (error) {
        throw new Error("Error in initializing standard deductions info");
    }
}
async function FederalTaxData() {
    try {        
        const taxable_income_bracket = await initialize_taxable_income_bracket();
        const capital_gains_bracket = await initialize_capital_gains_bracket();
        const standard_deductions = await initialize_standard_deductions_info();
        console.log("Federal Tax data successfully initialize");
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
        return {
            print_taxable_income_bracket,
            print_capital_gains_bracket,
            print_standard_deductions_info,
        };
    } catch (error) {
        console.error("Error in initializing federal tax data");
        process.exit(1);
    }
}


export default FederalTaxData;