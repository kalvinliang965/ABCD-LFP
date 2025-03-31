// src/db/repositories/TaxBracketRepository.ts
import { IncomeType, TaxFilingStatus } from "../../core/Enums";
import { TaxBrackets, create_tax_brackets } from "../../core/tax/TaxBrackets";
import TaxBracketModel, { ITaxBracket } from "../models/tax_bracket";

const save_bracket = async (
  min: number,
  max: number,
  rate: number,
  income_type: IncomeType,
  taxpayer_type: TaxFilingStatus
): Promise<void> => {
  try {
    const newBracket = new TaxBracketModel({
      min,
      max,
      rate,
      income_type: income_type,
      taxpayer_type: taxpayer_type,
    });
    await newBracket.save();
    //console.log(`Data add succesfully: ${taxpayer_type} AND ${income_type}: [${min}, ${max}] = ${rate}`);
  } catch (error) {
    throw new Error(`Internel Service error ${(error as Error).message}`);
  }
};


const load_capital_gains_brackets = async(): Promise<Array<ITaxBracket>> => {
  try {
    const capital_gains_bracket_list = await TaxBracketModel.find({
      income_type: IncomeType.CAPITAL_GAINS,
    });
    console.log(`${capital_gains_bracket_list.length} taxable brackets sucessfully loaded`);
    return capital_gains_bracket_list;
  } catch (error) {
    throw new Error(`Internel Service Error: ${error}`);
  }
}
const load_taxable_income_brackets = async (): Promise<Array<ITaxBracket>> => {
  try {
    const taxable_income_bracket_list = await TaxBracketModel.find({
      income_type: IncomeType.TAXABLE_INCOME,
    });
    console.log(`${taxable_income_bracket_list.length} taxable brackets sucessfully loaded`);
    return taxable_income_bracket_list;
  } catch (error) {
    throw new Error(`Internel Service Error: ${error}`);
  }
};


export {
  save_bracket,
  load_capital_gains_brackets,
  load_taxable_income_brackets,
};
