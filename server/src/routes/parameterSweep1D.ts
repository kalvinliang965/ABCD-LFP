import { Request, Response } from "express";
import Scenario from "../db/models/Scenario";
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import { createConsolidatedSimulationResult } from "../core/simulation/SimulationResult";
import { simulation_logger } from "../utils/logger/logger";
import { create_simulation_environment } from "../core/simulation/ LoadSimulationEnvironment";
import cloneDeep from "lodash.clonedeep";

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
    
    //determine list of parameter values to test
    const values = range
      ? Array.from(
          { length: Math.floor((range.upper - range.lower) / range.step) + 1 },
          (_, i) => range.lower + i * range.step
        )
      : [value];
      
    simulation_logger.info(`Running parameter sweep for parameter "${parameterType}" with ${values.length} values`);

    const results = [];
    
    //create simulation environment for original scenario
    const original_environment = await create_simulation_environment(scenarioId);
    
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
        
        //run simulations with the modified scenario
        const simulation_results = await engine.run(numSimulations);
        
        //create a consolidated result with the original scenarioId
        const consolidated_result = createConsolidatedSimulationResult(simulation_results, scenarioId);
        
        //override key fields based on parameter type to reflect the modified scenario
        if (parameterType === 'startYear') {
          //for start year parameter, override the start year
          consolidated_result.startYear = paramVal;
          
          //maintain the same duration by adjusting the end year
          const originalStartYear = consolidated_result.startYear; //use the original start year from the result
          const originalEndYear = consolidated_result.endYear;
          const duration = originalEndYear - originalStartYear;
          consolidated_result.endYear = paramVal + duration;
          
          simulation_logger.info(`Adjusted startYear to ${paramVal} and endYear to ${consolidated_result.endYear}`);
        } else if (parameterType === 'duration' && eventName) {
          //for duration parameter adjust the end year
          //find the modified event to get its start year
          const modifiedEvent = Array.from(mod_raw.eventSeries)
            .find((e: any) => e.name === eventName);
            
          if (modifiedEvent && modifiedEvent.start?.type === 'fixed' && typeof modifiedEvent.start?.value === 'number') {
            //if we have a fixed start, end year would be start + duration - 1
            consolidated_result.endYear = modifiedEvent.start.value + paramVal - 1;
            simulation_logger.info(`Adjusted duration: endYear set to ${consolidated_result.endYear}`);
          }
        }
        //for initial amount investment percentage, and Roth optimizer, 
        //don't need to adjust start/end years but add metadata
        else if (['initialAmount', 'investmentPercentage', 'rothOptimizer'].includes(parameterType)) {
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
    simulation_logger.error(`Error running parameter sweep: ${error instanceof Error ? error.stack : String(error)}`);
    res.status(500).json({
      success: false,
      message: "Failed to run parameter sweep simulation",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}; 