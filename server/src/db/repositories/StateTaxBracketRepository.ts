
// src/db/repositories/StateTaxBracketRepository.ts
import { IncomeType, StateType, TaxFilingStatus } from "../../core/Enums";
import { simulation_logger } from "../../utils/logger/logger";
import StateTaxBracketModel, { IStateTaxBracket, StateTaxBracketFields } from "../models/StateTaxBracket";


export const bulk_create_state_taxbrackets_in_db = async (
  brackets: Array<StateTaxBracketFields>
): Promise<void> => {
  try {

    if (!Array.isArray(brackets) || brackets.length === 0) {
      throw new Error('Input must be a non-empty array of tax brackets');
    }

    // 2. Group by taxpayer type and resident state
    const bracketGroups: Record<string, typeof brackets> = {};
    
    brackets.forEach(bracket => {
      // Validate individual bracket
      if (bracket.min < 0) throw new Error(`Min cannot be negative (got ${bracket.min})`);
      if (bracket.max !== null && bracket.max <= bracket.min) {
        throw new Error(`Max (${bracket.max}) must be null or greater than min (${bracket.min})`);
      }
      if (bracket.rate < 0 || bracket.rate > 1) {
        throw new Error(`Rate must be 0-1 (got ${bracket.rate})`);
      }

      const groupKey = `${bracket.taxpayer_type}_${bracket.resident_state}`;
      bracketGroups[groupKey] = bracketGroups[groupKey] || [];
      bracketGroups[groupKey].push(bracket);
    });

    // 3. Validate continuous ranges per group
    Object.entries(bracketGroups).forEach(([groupKey, groupBrackets]) => {
      // Sort by min value
      const sortedBrackets = [...groupBrackets].sort((a, b) => a.min - b.min);

      // Check starts at 0
      if (sortedBrackets[0].min !== 0) {
        throw new Error(`Brackets for ${groupKey} must start at 0`);
      }

      // Check continuity
      for (let i = 1; i < sortedBrackets.length; i++) {
        const prev = sortedBrackets[i - 1];
        const current = sortedBrackets[i];
        
        const expectedMin = prev.max === null ? null : prev.max + 1;
        
        if (expectedMin !== null && current.min !== expectedMin) {
          throw new Error(
            `Discontinuous brackets in ${groupKey}: ` +
            `Expected min ${expectedMin} after bracket ending at ${prev.max}, ` +
            `but got ${current.min}`
          );
        }
      }

      // Check only last has null max
      const nullMaxBrackets = sortedBrackets.filter(b => b.max === null);
      if (nullMaxBrackets.length > 1 || 
          (nullMaxBrackets.length === 1 && nullMaxBrackets[0] !== sortedBrackets[sortedBrackets.length - 1])) {
        throw new Error(`Only the last bracket in ${groupKey} can have null max`);
      }
    });

    // 4. Prepare bulk operations
    const operations = brackets.map(bracket => ({
      insertOne: {
        document: {
          ...bracket,
          max: bracket.max ?? Infinity, // Convert null to Infinity for storage
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }));

    // 5. Execute and log
    const result = await StateTaxBracketModel.bulkWrite(operations);
    
    simulation_logger.info("Successfully bulk inserted state tax brackets", {
      insertedCount: result.insertedCount,
      continuousValidation: "passed",
      bracketGroups: Object.keys(bracketGroups)
    });

  } catch (error) {
    simulation_logger.error("Bulk insert validation failed", {
      error: error instanceof Error ? error.message : 'Unknown error',
      validationFailed: true
    });
    throw error;
  }
};

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
//! Chen gonna use this to make the import yamls for the state tax brackets
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


