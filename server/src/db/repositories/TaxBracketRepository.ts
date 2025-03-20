// src/db/repositories/TaxBracketRepository.ts
import { TaxFilingStatus } from "../../core/Enums";
import { TaxBrackets, TaxBracket, TaxBracketsObject } from "../../core/tax/TaxBrackets";
import TaxBracketModel from "../models/tax_bracket";

const save_bracket = async (
    min: number, 
    max: number, 
    rate: number, 
    bracket_types: string, 
    taxpayer_types: string
): Promise<void> => {
    try {
        const newBracket = new TaxBracketModel({min, max, rate, bracket_types, taxpayer_types});
        await newBracket.save();
        console.log(`Data add succesfully: ${taxpayer_types} AND ${bracket_types}: [${min}, ${max}] = ${rate}`);
    } catch (error) {
        throw new Error(`Internel Service error ${(error as Error).message}`);
    }
}

const load_bracketAll = async (status: TaxFilingStatus): Promise<TaxBracketsObject> => {
    // TODO
    const taxBrackets = TaxBrackets();
    return taxBrackets;
}

export {
    save_bracket,
    load_bracketAll,
}
