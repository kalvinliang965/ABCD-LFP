import axios from "axios";
import { API_URL } from "./api";
import { ScenarioRaw } from "../types/Scenarios";
// AI-generated code
// Import serialization utility to handle Set objects in API calls
import { serialize_scenario_for_api } from "../utils/serialization";

const SCENARIO_ENDPOINT = `${API_URL}/scenarios`;

export const scenarioApi = {
  getAll: async (): Promise<ScenarioRaw[]> => {
    const response = await axios.get(SCENARIO_ENDPOINT);
    return response.data;
  },

  create: async (scenario: ScenarioRaw): Promise<ScenarioRaw> => {
    try {
      console.log("you are in scenarioApi.create");
      console.log("the end point is ", SCENARIO_ENDPOINT);
      // AI-generated code
      // Serialize the scenario object to convert Sets to arrays before sending
      const serializedScenario = serialize_scenario_for_api(scenario);
      console.log("Serialized scenario for API:", serializedScenario);

      const response = await axios.post(SCENARIO_ENDPOINT, serializedScenario);
      console.log("Scenario created:", scenario);
      return response.data;
    } catch (error) {
      console.error("Error creating scenario:", error);
      throw error;
    }
  },
};

export default scenarioApi;
