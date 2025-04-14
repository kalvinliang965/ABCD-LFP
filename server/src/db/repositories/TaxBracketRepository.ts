// src/db/repositories/TaxBracketRepository.ts
import { IncomeType, TaxFilingStatus } from "../../core/Enums";
import { simulation_logger } from "../../utils/logger/logger";
import TaxBracketModel, { ITaxBracket } from "../models/tax_bracket";

export const create_taxbracket_in_db = async (
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
    simulation_logger.info("Succesfully saved federal tax data", {
      taxpayer_type, 
      income_type,
      min,
      max,
      rate
    });
  } catch (error) {
    throw new Error(`Internel Service error ${(error as Error).message}`);
  }
};


export const get_capital_gains_brackets = async(): Promise<Array<ITaxBracket>> => {
  try {
    const capital_gains_bracket_list = await TaxBracketModel.find({
      income_type: IncomeType.CAPITAL_GAINS,
    });
    simulation_logger.info(`${capital_gains_bracket_list.length} taxable brackets sucessfully loaded`);
    return capital_gains_bracket_list;
  } catch (error) {
    throw new Error(`Internel Service Error: ${error}`);
  }
}
export const get_taxable_income_brackets = async (): Promise<Array<ITaxBracket>> => {
  try {
    const taxable_income_bracket_list = await TaxBracketModel.find({
      income_type: IncomeType.TAXABLE_INCOME,
    });
    simulation_logger.info(`${taxable_income_bracket_list.length} taxable brackets sucessfully loaded`);
    return taxable_income_bracket_list;
  } catch (error) {
    throw new Error(`Internel Service Error: ${error}`);
  }
};


