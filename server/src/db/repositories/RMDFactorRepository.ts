import RMDFactorModel from '../models/RMDFactorModel';

/**
 * Save RMD factors to the database
 * @param factors Map of age to distribution period
 */
export async function saveRMDFactors(factors: Map<number, number>): Promise<void> {
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
    console.error('Error saving RMD factors to database:', error);
    throw error;
  }
}

/**
 * Get RMD factors from the database
 * @returns Map of age to distribution period
 */
export async function getRMDFactorsFromDB(): Promise<Map<number, number>> {
  try {
    const factors = await RMDFactorModel.find().sort({ age: 1 });
    
    // Convert to a Map
    const factorMap = new Map<number, number>();
    factors.forEach(factor => {
      factorMap.set(factor.age, factor.distributionPeriod);
    });
    
    return factorMap;
  } catch (error) {
    console.error('Error getting RMD factors from database:', error);
    throw error;
  }
} 