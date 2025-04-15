import axios from 'axios';

import { ScenarioRaw } from '../types/Scenarios';

import { API_URL } from './api';
// AI-generated code
// Import serialization utility to handle Set objects in API calls

const YAML_ENDPOINT = `${API_URL}/yaml`;

export const scenarioYAMLService = {
  getAll: async (): Promise<ScenarioRaw[]> => {
    const response = await axios.get(YAML_ENDPOINT);
    return response.data;
  },

  create: async (yaml: string): Promise<ScenarioRaw> => {
    try {
      console.log('you are in YAML scenario api');
      const response = await axios.post(YAML_ENDPOINT, yaml, {
        headers: {
          'Content-Type': 'application/x-yaml',
        },
      });
      console.log('YAML scenario created:', yaml);
      return response.data;
    } catch (error) {
      console.error('Error creating YAML scenario:', error);
      throw error;
    }
  },
};

export default scenarioYAMLService;
