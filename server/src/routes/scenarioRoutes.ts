import express, { Request, Response } from "express";
import { create_scenario_raw } from "../core/domain/raw/scenario_raw";
import { create_scenario_raw_yaml } from "../services/ScenarioYamlParser";
import * as yaml from "js-yaml";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const yamlString = req.body;
  console.log("scenario", yamlString);
  console.log("type of scenario", typeof yamlString);

  const scenarioRaw = create_scenario_raw_yaml(yamlString);

  console.log("scenarioRaw: ", scenarioRaw);
  console.log("DONE");
  return res.status(201).json(scenarioRaw);

});

export default router;
