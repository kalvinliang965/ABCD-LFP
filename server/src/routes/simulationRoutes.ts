import express from "express";
import { Request, Response } from "express";
import Scenario from "../db/models/Scenario";
import { authenticateJWT } from "../middleware/auth.middleware";
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import {
  create_simulation_result,
  createConsolidatedSimulationResult,
} from "../core/simulation/SimulationResult";
import {
  save_simulation_result,
  get_simulation_result_by_id,
  get_simulation_results_by_scenario_id,
  get_simulation_results_by_user_id,
} from "../db/repositories/SimulationResultRepository";
import { simulation_logger } from "../utils/logger/logger";
import { create_simulation_environment } from "../core/simulation/ LoadSimulationEnvironment";
import { runParameterSweep1D } from "./parameterSweep1D";
import { runParameterSweep2D } from "./parameterSweep2D";

import { generate_seed } from "../utils/ValueGenerator";
import { create_simulation_result_v1 } from "../core/simulation/SimulationResult_v1";
import { debug_simulation_result } from "../core/simulation/SimulationResult_v1";
import { generate_investment_csv } from "../utils/logger/SimulationResultCSV";
import User from "../db/models/User";
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

    simulation_logger.info(
      `Simulation request received for scenario ${scenarioId} by user ${userId}`
    );
    simulation_logger.info(`Running ${count} simulations`);

    // Create simulation environment
    const random_base_seed = generate_seed();
    const simulationEnvironment = await create_simulation_environment(
      scenarioId,
      random_base_seed
    );

    simulation_logger.info("simulation routes: Start greating simulation");
    // Create simulation engine with the environment
    //! TODO: APril 28 th, Chen will work on this now
    const engine = await create_simulation_engine(simulationEnvironment);

    // Run multiple simulations
    const simulation_results = await engine.run(count);

    // Create a consolidated result from all simulations
    simulation_logger.info(
      `Creating consolidated result from ${simulation_results.length} simulations`
    );
    //console.log("simulationResults", simulationResults);
    //! seed and run count should be added to the consolidated result !!!!!!!
    const simulation_result = create_simulation_result_v1(
      simulation_results,
      random_base_seed,
      scenarioId
    );

    // Get user information for the CSV filename
    try {
      // If you have a User model, you might want to get the actual username
      // const user = await User.findById(userId);
      // username = user ? user.username : userId;
    } catch (error) {
      simulation_logger.warn(
        `Could not retrieve username for CSV, using userId instead: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Generate CSV file with investment data
    simulation_logger.info(`Generating investment CSV file`);
    const user = await User.findById(userId);
    const username = user?.name;
    simulation_logger.debug(`username: ${username}`);
    if (!username) {
      return res.status(404).json({
        success: false,
        message: "Username not found",
      });
    }
    const csv_filename = generate_investment_csv(simulation_result, username);
    simulation_logger.info(`Generated investment CSV file: ${csv_filename}`);

    // Save only the consolidated result to database
    const savedResult = await save_simulation_result(simulation_result);

    // Return the saved consolidated result
    res.status(200).json({
      success: true,
      simulationId: savedResult._id,
      scenarioId: scenarioId,
      //successProbability: consolidatedResult.successProbability,
      csvFilename: csv_filename,
      message: `Successfully ran ${simulation_results.length} simulations and saved consolidated result`,
    });
  } catch (error) {
    simulation_logger.error(
      `Error running simulation: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    res.status(500).json({
      success: false,
      message: "Failed to run simulation",
      error: error instanceof Error ? error.message : String(error),
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
    simulation_logger.error(
      `Error fetching simulation result: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch simulation result",
      error: error instanceof Error ? error.message : String(error),
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
    simulation_logger.error(
      `Error fetching simulation results: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch simulation results",
      error: error instanceof Error ? error.message : String(error),
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

    const simulationResults = await get_simulation_results_by_scenario_id(
      scenarioId
    );

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
    simulation_logger.error(
      `Error fetching scenario simulation results: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch scenario simulation results",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

//route to run a parameter sweep simulation for 1D
router.post("/param-sweep", runParameterSweep1D);

//route to run a parameter sweep simulation for 2D
router.post("/param-sweep-2d", runParameterSweep2D);

export default router;
