import mongoose from 'mongoose';
import SimulationResultModel, { ISimulationResult } from '../models/SimulationResultModel';
import { ConsolidatedResult } from '../../core/simulation/SimulationResult';
import { simulation_logger } from '../../utils/logger/logger';


export async function save_simulation_result(
  result: ConsolidatedResult,
  //userId: mongoose.Types.ObjectId | string
): Promise<ISimulationResult> {
  try {
    simulation_logger.info(`Saving simulation result for scenario: ${result.scenarioId}`);
    
    // Create a new document using the model
    const simulationResult = new SimulationResultModel({
      ...result,
      //...(userId && { userId })
    });
    
    // Save to database
    const savedResult = await simulationResult.save();
    simulation_logger.info(`Successfully saved simulation result with ID: ${savedResult._id}`);
    
    return savedResult;
  } catch (error) {
    simulation_logger.error(
      `Failed to save simulation result: ${error instanceof Error ? error.stack : String(error)}`
    );
    throw new Error(`Failed to save simulation result: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves a simulation result by its ID
 * @param id The ID of the simulation result to retrieve
 * @returns The simulation result document
 */
export async function get_simulation_result_by_id(id: string): Promise<ISimulationResult | null> {
  try {
    simulation_logger.debug(`Retrieving simulation result with ID: ${id}`);
    
    const result = await SimulationResultModel.findById(id);
    
    if (!result) {
      simulation_logger.info(`No simulation result found with ID: ${id}`);
      return null;
    }
    
    simulation_logger.debug(`Successfully retrieved simulation result with ID: ${id}`);
    return result;
  } catch (error) {
    simulation_logger.error(
      `Failed to retrieve simulation result: ${error instanceof Error ? error.stack : String(error)}`
    );
    throw new Error(`Failed to retrieve simulation result: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves all simulation results for a specific scenario
 * @param scenarioId The ID of the scenario
 * @returns Array of simulation result documents
 */
export async function get_simulation_results_by_scenario_id(
  scenarioId: string
): Promise<ISimulationResult[]> {
  try {
    simulation_logger.debug(`Retrieving simulation results for scenario: ${scenarioId}`);
    
    const results = await SimulationResultModel.find({ scenarioId });
    
    simulation_logger.debug(`Found ${results.length} simulation results for scenario: ${scenarioId}`);
    return results;
  } catch (error) {
    simulation_logger.error(
      `Failed to retrieve simulation results for scenario: ${error instanceof Error ? error.stack : String(error)}`
    );
    throw new Error(`Failed to retrieve simulation results: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves all simulation results for a specific user
 * @param userId The ID of the user
 * @returns Array of simulation result documents
 */
export async function get_simulation_results_by_user_id(
  userId: mongoose.Types.ObjectId | string
): Promise<ISimulationResult[]> {
  try {
    simulation_logger.debug(`Retrieving simulation results for user: ${userId}`);
    
    const results = await SimulationResultModel.find({ userId });
    
    simulation_logger.debug(`Found ${results.length} simulation results for user: ${userId}`);
    return results;
  } catch (error) {
    simulation_logger.error(
      `Failed to retrieve simulation results for user: ${error instanceof Error ? error.stack : String(error)}`
    );
    throw new Error(`Failed to retrieve simulation results: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Deletes a simulation result by its ID
 * @param id The ID of the simulation result to delete
 * @returns Boolean indicating success
 */
export async function delete_simulation_result(id: string): Promise<boolean> {
  try {
    simulation_logger.debug(`Deleting simulation result with ID: ${id}`);
    
    const result = await SimulationResultModel.findByIdAndDelete(id);
    
    if (!result) {
      simulation_logger.info(`No simulation result found with ID: ${id}`);
      return false;
    }
    
    simulation_logger.debug(`Successfully deleted simulation result with ID: ${id}`);
    return true;
  } catch (error) {
    simulation_logger.error(
      `Failed to delete simulation result: ${error instanceof Error ? error.stack : String(error)}`
    );
    throw new Error(`Failed to delete simulation result: ${error instanceof Error ? error.message : String(error)}`);
  }
} 