
// src/db/repositories/StateTaxBracketRepository.ts
import { IncomeType, StateType, TaxFilingStatus } from "../../core/Enums";
import { simulation_logger } from "../../utils/logger/logger";
import StateTaxBracketModel, { IStateTaxBracket } from "../models/StateTaxBracket";

export const save_state_tax_bracket = async (
  min: number,
  max: number,
  rate: number,
  taxpayer_type: TaxFilingStatus,
  resident_state: StateType,
): Promise<void> => {
  try {
    const newBracket = new StateTaxBracketModel({
      min,
      max,
      rate,
      taxpayer_type,
      resident_state,
    });
    await newBracket.save();
    simulation_logger.info("Succesfully saved state tax data", {
      taxpayer_type, 
      resident_state, 
      min,
      max,
      rate
    });
  } catch (error) {
    throw new Error(`Internel Service error ${(error as Error).message}`);
  }
};


export const has_state_data = async (resident_state: StateType):Promise<boolean> => {
  try {
    // we asssume if one bracket exist, then all of them should exist
    const bracket = await StateTaxBracketModel.findOne({
        resident_state,
    });
    return Boolean(bracket);
  } catch (error) {
    throw new Error(`Internel Service Error: ${error}`);
  }
}

export const load_state_taxable_income_brackets = async (resident_state: StateType): Promise<Array<IStateTaxBracket>> => {
  try {
    const taxable_income_bracket_list = await StateTaxBracketModel.find({
        resident_state,
    });
    simulation_logger.info(`${taxable_income_bracket_list.length} taxable brackets sucessfully loaded`);
    return taxable_income_bracket_list;
  } catch (error) {
    throw new Error(`Internel Service Error: ${error}`);
  }
};


