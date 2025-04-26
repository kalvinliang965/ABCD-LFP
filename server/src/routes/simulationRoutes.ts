import express from "express";
import { Request, Response } from "express";
import Scenario from "../db/models/Scenario";
import { authenticateJWT } from "../middleware/auth.middleware";
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import { create_simulation_result } from "../core/simulation/SimulationResult";

const router = express.Router();

router.use(authenticateJWT);

router.post("/", async (req: Request, res: Response) => {
  try {
    const { scenarioId, count } = req.body;

    //check if the scenario exists
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }
    console.log("Simulation request received for scenario:", scenario);
    console.log("Requested", count, "simulations");

    // Get scenario data as JSON string
    const scenarioJSON = JSON.stringify(scenario);
    
    // Create simulation engine (empty stateYAML for now)
    const engine = await create_simulation_engine(scenarioJSON, "");
    
    // Run multiple simulations
    const simulationResults = await engine.run(count);
    
    // Use the primary simulation result (first one) but pass all results for range calculations
    const primaryResult = simulationResults[0];
    const simulationResult = create_simulation_result(primaryResult, scenarioId, simulationResults);
    
    // Format results for frontend
    const formattedResults = simulationResult.formatResults();
    
    // Return results
    res.status(200).json({
      success: true,
      data: formattedResults,
    });
  } catch (error) {
    console.error("Error running simulation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to run simulation",
    });
  }
});

export default router;
