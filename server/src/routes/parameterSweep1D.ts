import { Request, Response } from "express";
import Scenario from "../db/models/Scenario";
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import { create_simulation_result_v1 } from "../core/simulation/SimulationResult_v1";
import { simulation_logger } from "../utils/logger/logger";
import { create_simulation_environment } from "../core/simulation/ LoadSimulationEnvironment";
import cloneDeep from "lodash.clonedeep";
import SimulationResultModel_v1 from "../db/models/SimulationResult_v1";

//route to run a parameter sweep simulation for 1D
export const runParameterSweep1D = async (req: Request, res: Response) => {
  try {
    const { scenarioId, parameterType, eventName, value, range, numSimulations = 5} = req.body;
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
    
    simulation_logger.info(`Parameter sweep simulation request received for scenario ${scenarioId} by user ${userId}`);
    simulation_logger.info(`Number of simulations to run per parameter value: ${numSimulations}`);
    
    //get the seed from the most recent simulation result
    const lastSim = await SimulationResultModel_v1.findOne({ scenarioId }).sort({ createdAt: -1 });
    if (!lastSim) {
      return res.status(404).json({
        success: false,
        message: "No previous simulation found for this scenario",
      });
    }
    
    const seedToUse = lastSim.seed;
    simulation_logger.info(`Using seed ${seedToUse} from previous simulation for parameter sweep`);
    
    //determine list of parameter values to test
    const values = range
      ? Array.from(
          { length: Math.floor((range.upper - range.lower) / range.step) + 1 },
          (_, i) => range.lower + i * range.step
        )
      : [value];
      
    simulation_logger.info(`Running parameter sweep for parameter "${parameterType}" with ${values.length} values`);

    const results = [];
    
    //create simulation environment for original scenario using the same seed
    const original_environment = await create_simulation_environment(scenarioId, seedToUse);
    
    for (const paramVal of values) {
      //deep clone the scenario for modification
      const mod_environment = cloneDeep(original_environment);
      const mod_raw = mod_environment.scenario_raw;

      //modify the cloned scenario based on parameter type
      switch (parameterType) {
        case 'rothOptimizer':
          mod_raw.RothConversionOpt = paramVal;
          break;
        case 'startYear':
          //convert Set to Array, map, then convert back to Set
          mod_raw.eventSeries = new Set(
            Array.from(mod_raw.eventSeries).map((e: any) =>
              e.name === eventName
                ? { ...e, start: { type: 'fixed', value: paramVal } }
                : e
            )
          );
          break;
        case 'duration':
          //convert Set to Array, map, then convert back to Set
          mod_raw.eventSeries = new Set(
            Array.from(mod_raw.eventSeries).map((e: any) =>
              e.name === eventName
                ? { ...e, duration: { type: 'fixed', value: paramVal } }
                : e
            )
          );
          break;
        case 'initialAmount':
          //convert Set to Array, map, then convert back to Set
          mod_raw.eventSeries = new Set(
            Array.from(mod_raw.eventSeries).map((e: any) =>
              e.name === eventName
                ? { ...e, initialAmount: paramVal }
                : e
            )
          );
          break;
        case 'investmentPercentage':
          //convert Set to Array, map, then convert back to Set
          mod_raw.eventSeries = new Set(
            Array.from(mod_raw.eventSeries).map((e: any) => {
              if (e.name !== eventName || e.type !== 'invest') return e;
              
              //handle asset allocation based on its format
              const alloc = { ...e.assetAllocation };
              const first_key = Object.keys(alloc)[0];
              const second_key = Object.keys(alloc)[1];
              
              if (first_key && second_key) {
                alloc[first_key] = paramVal / 100; //convert percentage to decimal
                alloc[second_key] = 1 - (paramVal / 100); //ensure they sum to 1
              }
              
              return { ...e, assetAllocation: alloc };
            })
          );
          break;
        default:
          return res.status(400).json({
            success: false,
            message: `Unsupported parameter type: ${parameterType}`
          });
      }

      try {
        //create simulation engine with the modified environment
        const engine = await create_simulation_engine(mod_environment);
        
        simulation_logger.info(`Running ${numSimulations} simulations for parameter value ${paramVal}`);
        //run simulations with the modified scenario
        const simulation_results = await engine.run(numSimulations);
        
        //create a consolidated result with the original scenarioId
        const consolidated_result = create_simulation_result_v1(simulation_results, seedToUse, scenarioId);
        
        //add metadata about the parameter for the UI 
        (consolidated_result as any).parameterMetadata = {
          type: parameterType,
          value: paramVal,
          eventName: eventName || null
        };
        
        if (parameterType === 'rothOptimizer') {
          simulation_logger.info(`Set Roth Optimizer flag to ${paramVal}`);
        } else {
          simulation_logger.info(`Set ${parameterType} to ${paramVal} for event "${eventName}"`);
        }
        
        //add result with its parameter value to the results array
        results.push({ 
          param: paramVal, 
          results: consolidated_result 
        });
        
        simulation_logger.info(`Completed simulation for parameter value ${paramVal}`);
      } catch (inner_error) {
        simulation_logger.error(`Error in simulation for parameter value ${paramVal}: ${inner_error instanceof Error ? inner_error.stack : String(inner_error)}`);
        
        //add error result to array instead of failing the entire request
        results.push({
          param: paramVal,
          error: inner_error instanceof Error ? inner_error.message : String(inner_error)
        });
      }
    }

    //return results
    res.status(200).json({
      success: true,
      parameterType,
      valueCount: values.length,
      data: results
    });
  } catch (error) {
    simulation_logger.error(`Error in parameter sweep: ${error instanceof Error ? error.stack : String(error)}`);
    res.status(500).json({
      success: false,
      message: "Failed to run parameter sweep",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}; 