import { Request, Response } from "express";
import Scenario from "../db/models/Scenario";
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import { createConsolidatedSimulationResult } from "../core/simulation/SimulationResult";
import { simulation_logger } from "../utils/logger/logger";
import { create_simulation_environment } from "../core/simulation/ LoadSimulationEnvironment";
import cloneDeep from "lodash.clonedeep";

//route to run a parameter sweep simulation for 2D
export const runParameterSweep2D = async (req: Request, res: Response) => {
  try {
    //Parameters from the request including numSimulations which controls
    //how many simulations to run for each parameter combination default is 5)
    const { scenarioId, parameter1, parameter2, numSimulations = 5 } = req.body;
    const userId = req.user?._id; //get user ID from auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    //check if the scenario exists
    const original_scenario = await Scenario.findById(scenarioId).lean();
    if (!original_scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }
    
    simulation_logger.info(`2D Parameter sweep simulation request received for scenario ${scenarioId} by user ${userId}`);
    
    //determine list of parameter values to test for parameter 1
    const param1_values = parameter1.range
      ? Array.from(
          { length: Math.floor((parameter1.range.upper - parameter1.range.lower) / parameter1.range.step) + 1 },
          (_, i) => parameter1.range.lower + i * parameter1.range.step
        )
      : [parameter1.value];
      
    //determine list of parameter values to test for parameter 2
    const param2_values = parameter2.range
      ? Array.from(
          { length: Math.floor((parameter2.range.upper - parameter2.range.lower) / parameter2.range.step) + 1 },
          (_, i) => parameter2.range.lower + i * parameter2.range.step
        )
      : [parameter2.value];
      
    simulation_logger.info(`Running 2D parameter sweep for parameter1 "${parameter1.type}" with ${param1_values.length} values and parameter2 "${parameter2.type}" with ${param2_values.length} values`);

    //create a map to store results with the key being a string of "param1Value,param2Value"
    const results: Record<string, any> = {};
    
    //create simulation environment for original scenario
    const original_environment = await create_simulation_environment(scenarioId);
    
    //run simulations for each combination of parameter values
    for (const param1_val of param1_values) {
      for (const param2_val of param2_values) {
        //deep clone the scenario for modification
        const mod_environment = cloneDeep(original_environment);
        const mod_raw = mod_environment.scenario_raw;

        //create a key for this parameter combination
        const param_key = `${param1_val},${param2_val}`;
        const param_description = `${parameter1.type}=${param1_val},${parameter2.type}=${param2_val}`;

        //modify the cloned scenario for parameter 1
        try {
          //modify the cloned scenario based on parameter type
          switch (parameter1.type) {
            case 'rothOptimizer':
              mod_raw.RothConversionOpt = param1_val;
              break;
            case 'startYear':
              //convert Set to Array, map, then convert back to Set
              mod_raw.eventSeries = new Set(
                Array.from(mod_raw.eventSeries).map((e: any) =>
                  e.name === parameter1.eventName
                    ? { ...e, start: { type: 'fixed', value: param1_val } }
                    : e
                )
              );
              break;
            case 'duration':
              //convert Set to Array, map, then convert back to Set
              mod_raw.eventSeries = new Set(
                Array.from(mod_raw.eventSeries).map((e: any) =>
                  e.name === parameter1.eventName
                    ? { ...e, duration: { type: 'fixed', value: param1_val } }
                    : e
                )
              );
              break;
            case 'initialAmount':
              //convert Set to Array, map, then convert back to Set
              mod_raw.eventSeries = new Set(
                Array.from(mod_raw.eventSeries).map((e: any) =>
                  e.name === parameter1.eventName
                    ? { ...e, initialAmount: param1_val }
                    : e
                )
              );
              break;
            case 'investmentPercentage':
              //convert Set to Array, map, then convert back to Set
              mod_raw.eventSeries = new Set(
                Array.from(mod_raw.eventSeries).map((e: any) => {
                  if (e.name === parameter1.eventName && e.type === 'invest') {
                    //extract a list of investment types from e
                    let investment_types: string[] = [];
                    if (e.assetAllocation && typeof e.assetAllocation === 'object') {
                      if (Array.isArray(e.assetAllocation)) {
                        investment_types = e.assetAllocation.map((i: any) => i.type);
                      } else {
                        //extract keys from object
                        investment_types = Object.keys(e.assetAllocation);
                      }
                    }
    
                    //if we have 2 or more investment types, adjust percentages
                    if (investment_types.length >= 2) {
                      //convert param1_val to decimal
                      const p1 = param1_val / 100;
                      const p2 = 1 - p1;
    
                      //create new allocation
                      let new_allocation: any;
                      if (Array.isArray(e.assetAllocation)) {
                        //for array format, create a new array with updated values
                        new_allocation = [
                          { type: investment_types[0], value: p1 },
                          { type: investment_types[1], value: p2 }
                        ];
                      } else {
                        //for object format, create a new object with updated values
                        new_allocation = {
                          [investment_types[0]]: p1,
                          [investment_types[1]]: p2
                        };
                      }
    
                      return { ...e, assetAllocation: new_allocation };
                    }
                  }
                  return e;
                })
              );
              break;
          }

          //modify the cloned scenario for parameter 2
          switch (parameter2.type) {
            case 'rothOptimizer':
              mod_raw.RothConversionOpt = param2_val;
              break;
            case 'startYear':
              //convert Set to Array, map, then convert back to Set
              mod_raw.eventSeries = new Set(
                Array.from(mod_raw.eventSeries).map((e: any) =>
                  e.name === parameter2.eventName
                    ? { ...e, start: { type: 'fixed', value: param2_val } }
                    : e
                )
              );
              break;
            case 'duration':
              //convert Set to Array, map, then convert back to Set
              mod_raw.eventSeries = new Set(
                Array.from(mod_raw.eventSeries).map((e: any) =>
                  e.name === parameter2.eventName
                    ? { ...e, duration: { type: 'fixed', value: param2_val } }
                    : e
                )
              );
              break;
            case 'initialAmount':
              //convert Set to Array, map, then convert back to Set
              mod_raw.eventSeries = new Set(
                Array.from(mod_raw.eventSeries).map((e: any) =>
                  e.name === parameter2.eventName
                    ? { ...e, initialAmount: param2_val }
                    : e
                )
              );
              break;
            case 'investmentPercentage':
              //convert Set to Array, map, then convert back to Set
              mod_raw.eventSeries = new Set(
                Array.from(mod_raw.eventSeries).map((e: any) => {
                  if (e.name === parameter2.eventName && e.type === 'invest') {
                    //extract a list of investment types from e
                    let investment_types: string[] = [];
                    if (e.assetAllocation && typeof e.assetAllocation === 'object') {
                      if (Array.isArray(e.assetAllocation)) {
                        investment_types = e.assetAllocation.map((i: any) => i.type);
                      } else {
                        //extract keys from object
                        investment_types = Object.keys(e.assetAllocation);
                      }
                    }
    
                    //if we have 2 or more investment types, adjust percentages
                    if (investment_types.length >= 2) {
                      //convert param2_val to decimal
                      const p1 = param2_val / 100;
                      const p2 = 1 - p1;
    
                      //create new allocation
                      let new_allocation: any;
                      if (Array.isArray(e.assetAllocation)) {
                        //for array format, create a new array with updated values
                        new_allocation = [
                          { type: investment_types[0], value: p1 },
                          { type: investment_types[1], value: p2 }
                        ];
                      } else {
                        //for object format, create a new object with updated values
                        new_allocation = {
                          [investment_types[0]]: p1,
                          [investment_types[1]]: p2
                        };
                      }
    
                      return { ...e, assetAllocation: new_allocation };
                    }
                  }
                  return e;
                })
              );
              break;
          }

          //create simulation engine with the modified environment
          const engine = await create_simulation_engine(mod_environment);
          
          //run simulations with the modified scenario
          const simulation_results = await engine.run(numSimulations);
          
          //create a consolidated result with the original scenarioId
          const consolidated_result = createConsolidatedSimulationResult(simulation_results, scenarioId);
          
          //add metadata about the parameters for the UI
          (consolidated_result as any).parameterMetadata = {
            param1: {
              type: parameter1.type,
              value: param1_val,
              eventName: parameter1.eventName || null
            },
            param2: {
              type: parameter2.type,
              value: param2_val,
              eventName: parameter2.eventName || null
            }
          };
          
          //add result to the results map
          results[param_key] = { 
            results: consolidated_result 
          };
          
          simulation_logger.info(`Completed simulation for parameter combination: ${param_description}`);
        } catch (inner_error) {
          simulation_logger.error(`Error in simulation for parameter combination ${param_description}: ${inner_error instanceof Error ? inner_error.stack : String(inner_error)}`);
          
          //add error result to map instead of failing the entire request
          results[param_key] = {
            error: inner_error instanceof Error ? inner_error.message : String(inner_error)
          };
        }
      }
    }

    //return results
    res.status(200).json({
      success: true,
      parameter1Type: parameter1.type,
      parameter2Type: parameter2.type,
      param1Count: param1_values.length,
      param2Count: param2_values.length,
      data: results
    });
  } catch (error) {
    simulation_logger.error(`Error running 2D parameter sweep: ${error instanceof Error ? error.stack : String(error)}`);
    res.status(500).json({
      success: false,
      message: "Failed to run 2D parameter sweep simulation",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}; 