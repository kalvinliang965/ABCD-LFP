// src/db/repositories/TaxBracketRepository.ts
import { TaxFilingStatus } from "../../core/Enums";
import { TaxBrackets, TaxBracketSet, TaxBracketsObject } from "../../core/tax/TaxBrackets";

interface TaxBracketRepository {
    save_brackets(status: TaxFilingStatus, brackets: TaxBracketSet): Promise<void>;
    load_brackets(status: TaxFilingStatus): Promise<TaxBracketsObject>;
}

export function MongoTaxBracketRepository(): TaxBracketRepository {

    const save_brackets = async (status: TaxFilingStatus, brackets: TaxBracketSet): Promise<void> => {
        // TODO
    }
    const load_brackets = async (status: TaxFilingStatus): Promise<TaxBracketsObject> => {
        // TODO
        const taxBrackets = TaxBrackets();
        return taxBrackets;
    }


    return {
        save_brackets,
        load_brackets,
    }
}
