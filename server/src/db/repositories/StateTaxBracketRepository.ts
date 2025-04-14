
// src/db/repositories/StateTaxBracketRepository.ts
import { IncomeType, StateType, TaxFilingStatus } from "../../core/Enums";
import { simulation_logger } from "../../utils/logger/logger";
import StateTaxBracketModel, { IStateTaxBracket } from "../models/StateTaxBracket";

export const create_state_taxbracket_in_db = async (
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
    simulation_logger.error(`Internel Service error`, {
      error: error instanceof Error? error.stack: error
    })
    throw new Error(`Internel Service error ${(error as Error).message}`);
  }
};

export const delete_state_tax_brackets_by_state = async (resident_state: StateType): Promise<number> => {
  try {
    const result = await StateTaxBracketModel.deleteMany({
      resident_state,
    });
    simulation_logger.info(`Successfully removed ${result.deletedCount} state element`);
    return result.deletedCount;
  } catch (error) {
    simulation_logger.error(`Internel Service error`, {
      error: error instanceof Error? error.stack: error
    })
    throw new Error(`Interel Service Error: ${error instanceof Error? error.message: error}`)
  }
}
export const state_taxbrackets_exist_in_db = async (resident_state: StateType):Promise<boolean> => {
  try {
    // we asssume if one bracket exist, then all of them should exist
    const bracket = await StateTaxBracketModel.findOne({
        resident_state,
    });
    return Boolean(bracket);
  } catch (error) {
    simulation_logger.error(`Internel Service error`, {
      error: error instanceof Error? error.stack: error
    })
    throw new Error(`Internel Service Error: ${error}`);
  }
}

export const get_state_taxbrackets_by_state = async (resident_state: StateType): Promise<Array<IStateTaxBracket>> => {
  try {
    const taxable_income_bracket_list = await StateTaxBracketModel.find({
        resident_state,
    });
    simulation_logger.info(`${taxable_income_bracket_list.length} taxable brackets sucessfully loaded`);
    return taxable_income_bracket_list;
  } catch (error) {
    simulation_logger.error(`Internel Service error`, {
      error: error instanceof Error? error.stack: error
    })
    throw new Error(`Internel Service Error: ${error}`);
  }
};


