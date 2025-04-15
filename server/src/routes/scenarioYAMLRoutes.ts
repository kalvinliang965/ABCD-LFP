import express, { Request, Response } from "express";
import { create_scenario_raw_yaml } from "../services/ScenarioYamlParser";
import Scenario from "../db/models/Scenario";
import { authenticateJWT } from "../middleware/auth.middleware";
import { UserDocument } from "../db/models/User";
import * as yaml from "js-yaml";


const router = express.Router();


// Apply authentication middleware to all routes
router.use(authenticateJWT);


router.post("/", async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }


    const yamlString = req.body;
    //console.log("yaml: ", yamlString);


    // Parse the YAML into a scenario object
    const scenarioRaw = create_scenario_raw_yaml(yamlString);
    //console.log("scenarioRaw: ", scenarioRaw);


    // Create a scenario_data object with the correct structure
    const scenario_data: any = {
      ...scenarioRaw,
      userId: user._id,
      isDraft: false, // Always set isDraft to false for YAML imports
    };


    console.log("scenario_data in yaml route: ", scenario_data);


    // Convert Sets to Arrays for the nested objects
    if (scenario_data.investmentTypes) {
      scenario_data.investmentTypes = Array.from(scenario_data.investmentTypes);
    }


    if (scenario_data.investments) {
      scenario_data.investments = Array.from(scenario_data.investments);
    }


    if (scenario_data.eventSeries) {
      scenario_data.eventSeries = Array.from(scenario_data.eventSeries);
    }


    console.log(
      "Fixed investmentTypes:",
      Array.isArray(scenario_data.investmentTypes)
    );
    console.log("Fixed investments:", Array.isArray(scenario_data.investments));
    console.log("Fixed eventSeries:", Array.isArray(scenario_data.eventSeries));


    // Save to database
    const new_scenario = new Scenario(scenario_data);
    await new_scenario.save();


    console.log("--------------------------------");
    console.log("new_scenario: ", new_scenario.investmentTypes[0]);
    console.log("YAML scenario saved successfully");


    return res.status(201).json({
      success: true,
      message: "YAML scenario imported successfully",
      data: new_scenario,
    });
  } catch (error) {
    console.error("Error importing YAML scenario:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to import YAML scenario",
    });
  }
});


export default router;