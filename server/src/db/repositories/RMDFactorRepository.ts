import { tax_config } from '../../config/tax';
import { simulation_logger } from '../../utils/logger/logger';
import RMDFactorModel from '../models/RMDFactorModel';

/**
 * Save RMD factors to the database
 * @param factors Map of age to distribution period
 */
export async function save_rmd_factors_to_db(factors: Map<number, number>): Promise<void> {
  try {
    // Convert the map to an array of documents
    const documents = Array.from(factors.entries()).map(([age, distributionPeriod]) => ({
      age,
      distributionPeriod,
      updatedAt: new Date()
    }));
    
    // Use bulkWrite for efficiency
    await RMDFactorModel.bulkWrite(
      documents.map(doc => ({
        updateOne: {
          filter: { age: doc.age },
          update: { $set: doc },
          upsert: true
        }
      }))
    );
    
    console.log(`Saved ${documents.length} RMD factors to database`);
  } catch (error) {
    simulation_logger.error(`Error saving RMD factors to database: ${error}`);
    throw new Error(`Error saving RMD factors to database: ${error}`);
  }
}

/**
 * Get RMD factors from the database
 * @returns Map of age to distribution period
 */
export async function get_rmd_factors_from_db(): Promise<Map<number, number>> {
  try {
    const factors = await RMDFactorModel.find().sort({ age: 1 });
    
    // Convert to a Map
    const factorMap = new Map<number, number>();
    factors.forEach(factor => {
      factorMap.set(factor.age, factor.distributionPeriod);
    });
    
    if (factorMap && factorMap.size > 0) {
      for (let i = tax_config.RMD_START_AGE; i <= tax_config.MAX_RMD_AGE; ++i) {
        if (!factorMap.has(i)) {
          simulation_logger.error(`Database contian incomplete RMD table. Missing age ${i}`);
          throw new Error(`Database contian incomplete RMD table. Missing age ${i}`);
        }
      }
    }
    
    return factorMap;
  } catch (error) {
    simulation_logger.error(`Error getting RMD factors from database: ${error}`);
    throw new Error(`Error getting RMD factors from database: ${error}`);
  }
} 

export async function delete_all_rmd_factors_from_db() {
  try {
    await RMDFactorModel.deleteMany({});
  } catch (error) {
    simulation_logger.error(`Error deleting RMD factors from database: ${error}`);
    throw new Error(`Error deleting RMD factors from database: ${error}`);
  }
}