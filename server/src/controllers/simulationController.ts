
// export const runSimulation = async (req: Request, res: Response) => {
//     try {
//       const { scenarioId, numSimulations = 1000 } = req.body;
      
//       // Get scenario from database
//       const scenario = await Scenario.findById(scenarioId);
//       if (!scenario) return res.status(404).json({ message: 'Scenario not found' });
      
//       // Convert scenario to YAML for simulation
//       const scenarioYAML = convertToYAML(scenario);
      
//       // Run simulation
//       const engine = await create_simulation_engine(scenarioYAML, stateYAML);
//       const simResults = await engine.run(numSimulations);
      
//       // Create simulation result object
//       const simulationResult = create_simulation_result(simResults[0]);
      
//       // Save to database
//       const dbResult = await SimulationResult.create({
//         scenarioId,
//         userId: req.user._id,
//         yearlyResults: simulationResult.formatForDatabase().yearlyResults,
//         successProbability: simulationResult.successProbability
//       });
      
//       // Return formatted result for frontend
//       res.status(200).json(simulationResult.formatForCharts());
//     } catch (error) {
//       res.status(500).json({ message: 'Error running simulation', error });
//     }
//   };