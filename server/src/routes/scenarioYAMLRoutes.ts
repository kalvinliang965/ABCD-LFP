import express, { Request, Response } from "express";
import { create_scenario_raw } from "../core/domain/raw/scenario_raw";
import { create_scenario_raw_yaml } from "../services/ScenarioYamlParser";
import * as yaml from "js-yaml";
import Scenario from "../db/models/Scenario";
import User from "../db/models/User";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", authenticateJWT, async (req: Request, res: Response) => {
  const yamlString = req.body;
  console.log("scenario\n", yamlString);
  console.log("type of scenario", typeof yamlString);

  const scenarioRaw = create_scenario_raw_yaml(yamlString);

  // 1. Save the parsed scenario to the Scenario collection
  const newScenario = new Scenario({
    ...scenarioRaw,
    owner: (req.user as any)?._id, // if you track ownership
    userId: (req.user as any)?.googleId || (req.user as any)?._id // Example if userId should be googleId
  });

  const savedScenario = await newScenario.save();

  // 2. Find the user and push only the scenario ID
  const user = await User.findById((req.user as any)?._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.scenarios.push(savedScenario._id); // << push only the ObjectId
  await user.save();

  //return res.status(201).json({ success: true, scenarioId: savedScenario._id });

  console.log("scenarioRaw: ", scenarioRaw);
  console.log("DONE");
  return res.status(201).json(scenarioRaw);

});

export default router;
