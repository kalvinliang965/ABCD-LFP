// src/db/repositories/TaxBracketRepository.ts
import { IncomeType, TaxFilingStatus } from "../../core/Enums";
import { TaxBrackets, create_tax_brackets } from "../../core/tax/TaxBrackets";
import TaxBracketModel from "../models/tax_bracket";

const save_bracket = async (
    min: number, 
    max: number, 
    rate: number, 
    income_type: IncomeType, 
    taxpayer_type: TaxFilingStatus
): Promise<void> => {
    try {
        const newBracket = new TaxBracketModel({min, max, rate, income_type: income_type, taxpayer_type: taxpayer_type});
        await newBracket.save();
        console.log(`Data add succesfully: ${taxpayer_type} AND ${income_type}: [${min}, ${max}] = ${rate}`);
    } catch (error) {
        throw new Error(`Internel Service error ${(error as Error).message}`);
    }
}

const load_brackets = async (income_type: IncomeType): Promise<TaxBrackets> => {
    try {
        const taxBrackets = create_tax_brackets();
        // find single bracket
        const single_capital_gains_brackets = await TaxBracketModel.find({
            income_type: income_type,
            taxpayer_type: TaxFilingStatus.SINGLE,
        });
        single_capital_gains_brackets.forEach((bracket) => {
            const { min, max, rate } = bracket;
            taxBrackets.add_rate(min, max, rate, TaxFilingStatus.SINGLE);
        });
        // find married bracket
        const married_taxable_income_brackets = await TaxBracketModel.find({
            income_type: income_type,
            taxpayer_type: TaxFilingStatus.MARRIED,
        });
        married_taxable_income_brackets.forEach((bracket) => {
            const { min, max, rate } = bracket;
            taxBrackets.add_rate(min, max, rate, TaxFilingStatus.MARRIED);
        });
        console.log(`${income_type} brackets sucessfully loaded`);
        return taxBrackets;
    } catch (error) {
        throw new Error(`Internel Service Error: ${error}`)
    }
}

// the following three function check if brackets already exist in database
// we assume if one bracket exist, then we have store the entire table
const check_taxable_income = async (): Promise<boolean> => {
    try {
        const res = await TaxBracketModel.find({income_type: IncomeType.TAXABLE_INCOME });
        return res.length > 0;
    } catch (error) {
        throw new Error("Internel service error");
    }
}

const check_capital_gains = async (): Promise<boolean> => {
    try {
        const res = await TaxBracketModel.find({ income_type: IncomeType.CAPITAL_GAINS });
        return res.length > 0;
    } catch (error) {
        throw new Error(`Internel service error ${error}`)
    }
}


export {
    save_bracket,
    load_brackets,
    check_capital_gains,
    check_taxable_income,
}

