import express from "express";
import { Request, Response } from "express";
import Scenario from "../db/models/Scenario";
import { authenticateJWT } from "../middleware/auth.middleware";
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import { create_simulation_result, createConsolidatedSimulationResult } from "../core/simulation/SimulationResult";
import { save_simulation_result, get_simulation_result_by_id, get_simulation_results_by_scenario_id, get_simulation_results_by_user_id } from "../db/repositories/SimulationResultRepository";
import { simulation_logger } from "../utils/logger/logger";
import { create_simulation_environment } from "../core/simulation/ LoadSimulationEnvironment";

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface User {
      _id: string;
    }
  }
}

const router = express.Router();

router.use(authenticateJWT);

// Route to run a simulation and save results
router.post("/", async (req: Request, res: Response) => {
  try {
    const { scenarioId, count } = req.body;
    const userId = req.user?._id; // Get user ID from auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    // Check if the scenario exists
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }
    
    simulation_logger.info(`Simulation request received for scenario ${scenarioId} by user ${userId}`);
    simulation_logger.info(`Running ${count} simulations`);

    // Create simulation environment
    const simulationEnvironment = await create_simulation_environment(scenarioId);
    console.log("we are ");
    
    // Create simulation engine with the environment
    //! TODO: APril 28 th, Chen will work on this now
    const engine = await create_simulation_engine(simulationEnvironment);
    
    // Run multiple simulations
    const simulationResults = await engine.run(count);
    
    // Create a consolidated result from all simulations
    simulation_logger.info(`Creating consolidated result from ${simulationResults.length} simulations`);
    const consolidatedResult = createConsolidatedSimulationResult(simulationResults, scenarioId);
    
    // Save only the consolidated result to database
    simulation_logger.info(`Saving consolidated result to database`);
    const savedResult = await save_simulation_result(consolidatedResult);
    
    // Return the saved consolidated result
    res.status(200).json({
      success: true,
      simulationId: savedResult._id,
      scenarioId: scenarioId,
      successProbability: consolidatedResult.successProbability,
      startYear: consolidatedResult.startYear,
      endYear: consolidatedResult.endYear,
      message: `Successfully ran ${simulationResults.length} simulations and saved consolidated result`
    });
  } catch (error) {
    simulation_logger.error(`Error running simulation: ${error instanceof Error ? error.stack : String(error)}`);
    res.status(500).json({
      success: false,
      message: "Failed to run simulation",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Route to get a specific simulation result
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const simulationResult = await get_simulation_result_by_id(id);
    
    if (!simulationResult) {
      return res.status(404).json({
        success: false,
        message: "Simulation result not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: simulationResult,
    });
  } catch (error) {
    simulation_logger.error(`Error fetching simulation result: ${error instanceof Error ? error.stack : String(error)}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch simulation result",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Route to get all simulation results for the current user
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const simulationResults = await get_simulation_results_by_user_id(userId);
    
    res.status(200).json({
      success: true,
      count: simulationResults.length,
      data: simulationResults,
    });
  } catch (error) {
    simulation_logger.error(`Error fetching simulation results: ${error instanceof Error ? error.stack : String(error)}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch simulation results",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Route to get all simulation results for a specific scenario
router.get("/scenario/:scenarioId", async (req: Request, res: Response) => {
  try {
    const { scenarioId } = req.params;
    const { limit } = req.query; // Add a limit parameter to control how many results to return
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    // Check if the scenario exists
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }
    
    // Removed user ownership check to allow access to any scenario's simulation results
    // as long as the user is authenticated

    const simulationResults = await get_simulation_results_by_scenario_id(scenarioId);
    
    // If limit is specified, return only that many results
    let resultsToReturn = simulationResults;
    const limitNum = limit ? parseInt(limit as string, 10) : 0;
    
    if (limitNum > 0 && limitNum < simulationResults.length) {
      resultsToReturn = simulationResults.slice(0, limitNum);
    }
    
    res.status(200).json({
      success: true,
      count: simulationResults.length,
      returnedCount: resultsToReturn.length,
      data: resultsToReturn,
    });
  } catch (error) {
    simulation_logger.error(`Error fetching scenario simulation results: ${error instanceof Error ? error.stack : String(error)}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch scenario simulation results",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
