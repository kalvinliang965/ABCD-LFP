import express, { Request, Response } from "express";
import { create_scenario_raw } from "../core/domain/raw/scenario_raw";
import { create_scenario_raw_yaml } from "../services/ScenarioYamlParser";
import * as yaml from "js-yaml";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const rawScenario = req.body;
  // Process the incoming data to convert arrays back to Sets
  console.log("scenario", rawScenario);
  console.log("type of scenario", typeof rawScenario);

  // AI-generated code
  // Convert rawScenario to a string before passing to the YAML parser
  const rawScenarioString = JSON.stringify(rawScenario);
  const yaml_file = JSON.parse(rawScenarioString);
  const dump_yaml = yaml.dump(yaml_file);
  console.log("rawScenarioString", dump_yaml);
  const scenarioRaw = create_scenario_raw_yaml(dump_yaml);

  console.log("scenarioRaw", scenarioRaw);
  //res.status(201).json(scenarioRaw);
});

export default router;
