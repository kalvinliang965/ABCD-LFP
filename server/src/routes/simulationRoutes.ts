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
import cloneDeep from "lodash.clonedeep";
import { generate_seed } from "../utils/ValueGenerator";
import { create_simulation_result_v1 } from "../core/simulation/SimulationResult_v1";
import { debug_simulation_result } from "../core/simulation/SimulationResult_v1";
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
    const simulationResults = await engine.run(count);

    // Create a consolidated result from all simulations
    simulation_logger.info(
      `Creating consolidated result from ${simulationResults.length} simulations`
    );
    //console.log("simulationResults", simulationResults);
    //! seed and run count should be added to the consolidated result !!!!!!!
    const simulation_result = create_simulation_result_v1(
      simulationResults,
      random_base_seed,
      scenarioId
    );

    simulation_logger.info(`simulation_result: ${simulation_result}`);
    // AI-generated code
    // Add debug call to inspect simulation result
    debug_simulation_result(simulation_result, true);

    // Save only the consolidated result to database
    const savedResult = await save_simulation_result(simulation_result);

    // Return the saved consolidated result
    res.status(200).json({
      success: true,
      simulationId: savedResult._id,
      scenarioId: scenarioId,
      //successProbability: consolidatedResult.successProbability,
      message: `Successfully ran ${simulationResults.length} simulations and saved consolidated result`,
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
router.post("/param-sweep", async (req: Request, res: Response) => {
  try {
    //ATTN: CHANGE SIMULATION NUMBER HERE
    const {
      scenarioId,
      parameterType,
      eventName,
      value,
      range,
      numSimulations = 5,
    } = req.body;
    const userId = req.user?._id; //get user ID from auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    //check if the scenario exists
    const originalScenario = await Scenario.findById(scenarioId).lean();
    if (!originalScenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }

    simulation_logger.info(
      `Parameter sweep simulation request received for scenario ${scenarioId} by user ${userId}`
    );

    //determine list of parameter values to test
    const values = range
      ? Array.from(
          { length: Math.floor((range.upper - range.lower) / range.step) + 1 },
          (_, i) => range.lower + i * range.step
        )
      : [value];

    simulation_logger.info(
      `Running parameter sweep for parameter "${parameterType}" with ${values.length} values`
    );

    const results = [];

    // ! do we really want random seed?
    const random_base_seed = generate_seed();
    //create simulation environment for original scenario
    const original_environment = await create_simulation_environment(
      scenarioId,
      random_base_seed
    );

    for (const paramVal of values) {
      //deep clone the scenario for modification
      const mod_environment = cloneDeep(original_environment);
      const mod_raw = mod_environment.scenario_raw;

      //modify the cloned scenario based on parameter type
      switch (parameterType) {
        case "rothOptimizer":
          mod_raw.RothConversionOpt = paramVal;
          break;
        case "startYear":
          //convert Set to Array, map, then convert back to Set
          mod_raw.eventSeries = new Set(
            Array.from(mod_raw.eventSeries).map((e: any) =>
              e.name === eventName
                ? { ...e, start: { type: "fixed", value: paramVal } }
                : e
            )
          );
          break;
        case "duration":
          //convert Set to Array, map, then convert back to Set
          mod_raw.eventSeries = new Set(
            Array.from(mod_raw.eventSeries).map((e: any) =>
              e.name === eventName
                ? { ...e, duration: { type: "fixed", value: paramVal } }
                : e
            )
          );
          break;
        case "initialAmount":
          //convert Set to Array, map, then convert back to Set
          mod_raw.eventSeries = new Set(
            Array.from(mod_raw.eventSeries).map((e: any) =>
              e.name === eventName ? { ...e, initialAmount: paramVal } : e
            )
          );
          break;
        case "investmentPercentage":
          //convert Set to Array, map, then convert back to Set
          mod_raw.eventSeries = new Set(
            Array.from(mod_raw.eventSeries).map((e: any) => {
              if (e.name !== eventName || e.type !== "invest") return e;

              //handle asset allocation based on its format
              const alloc = { ...e.assetAllocation };
              const first_key = Object.keys(alloc)[0];
              const second_key = Object.keys(alloc)[1];

              if (first_key && second_key) {
                alloc[first_key] = paramVal / 100; //convert percentage to decimal
                alloc[second_key] = 1 - paramVal / 100; //ensure they sum to 1
              }

              return { ...e, assetAllocation: alloc };
            })
          );
          break;
        default:
          return res.status(400).json({
            success: false,
            message: `Unsupported parameter type: ${parameterType}`,
          });
      }

      try {
        //create simulation engine with the modified environment
        const engine = await create_simulation_engine(mod_environment);

        //run simulations with the modified scenario
        const simulation_results = await engine.run(numSimulations);

        //create a consolidated result with the original scenarioId
        const consolidated_result = createConsolidatedSimulationResult(
          simulation_results,
          scenarioId
        );

        //override key fields based on parameter type to reflect the modified scenario
        if (parameterType === "startYear") {
          //for start year parameter, override the start year
          consolidated_result.startYear = paramVal;

          //maintain the same duration by adjusting the end year
          const originalStartYear = consolidated_result.startYear; //use the original start year from the result
          const originalEndYear = consolidated_result.endYear;
          const duration = originalEndYear - originalStartYear;
          consolidated_result.endYear = paramVal + duration;

          simulation_logger.info(
            `Adjusted startYear to ${paramVal} and endYear to ${consolidated_result.endYear}`
          );
        } else if (parameterType === "duration" && eventName) {
          //for duration parameter adjust the end year
          //find the modified event to get its start year
          const modifiedEvent = Array.from(mod_raw.eventSeries).find(
            (e: any) => e.name === eventName
          );

          if (
            modifiedEvent &&
            modifiedEvent.start?.type === "fixed" &&
            typeof modifiedEvent.start?.value === "number"
          ) {
            //if we have a fixed start, end year would be start + duration - 1
            consolidated_result.endYear =
              modifiedEvent.start.value + paramVal - 1;
            simulation_logger.info(
              `Adjusted duration: endYear set to ${consolidated_result.endYear}`
            );
          }
        }
        //for initial amount investment percentage, and Roth optimizer,
        //don't need to adjust start/end years but add metadata
        else if (
          ["initialAmount", "investmentPercentage", "rothOptimizer"].includes(
            parameterType
          )
        ) {
          //add metadata about the parameter for the UI
          (consolidated_result as any).parameterMetadata = {
            type: parameterType,
            value: paramVal,
            eventName: eventName || null,
          };

          if (parameterType === "rothOptimizer") {
            simulation_logger.info(`Set Roth Optimizer flag to ${paramVal}`);
          } else {
            simulation_logger.info(
              `Set ${parameterType} to ${paramVal} for event "${eventName}"`
            );
          }
        }

        //add result with its parameter value to the results array
        results.push({
          param: paramVal,
          results: consolidated_result,
        });

        simulation_logger.info(
          `Completed simulation for parameter value ${paramVal}`
        );
      } catch (inner_error) {
        simulation_logger.error(
          `Error in simulation for parameter value ${paramVal}: ${
            inner_error instanceof Error
              ? inner_error.stack
              : String(inner_error)
          }`
        );

        //add error result to array instead of failing the entire request
        results.push({
          param: paramVal,
          error:
            inner_error instanceof Error
              ? inner_error.message
              : String(inner_error),
        });
      }
    }

    //return results
    res.status(200).json({
      success: true,
      parameterType,
      valueCount: values.length,
      data: results,
    });
  } catch (error) {
    simulation_logger.error(
      `Error running parameter sweep: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    res.status(500).json({
      success: false,
      message: "Failed to run parameter sweep simulation",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
