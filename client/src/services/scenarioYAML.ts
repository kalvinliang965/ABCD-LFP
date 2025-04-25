import axios from 'axios';

import { ScenarioRaw } from '../types/Scenarios';

import { API_URL } from './api';
// AI-generated code
// Import serialization utility to handle Set objects in API calls

const YAML_ENDPOINT = `${API_URL}/yaml`;

// AI-generated code
// Add function to convert plain objects back to Maps if needed
// it must be any type since the data is coming from the server
function process_serialized_data(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => process_serialized_data(item));
  }

  if (typeof data === 'object') {
    // Process all properties of the object
    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = process_serialized_data(data[key]);
      }
    }
    return result;
  }

  return data;
}
//! not every case should be successful, so we need to handle the error
export const scenarioYAMLService = {
  create: async (yaml: string): Promise<ScenarioRaw> => {
    try {
      console.log('you are in YAML scenario api');
      const response = await axios.post(YAML_ENDPOINT, yaml, {
        headers: {
          'Content-Type': 'application/x-yaml',
        },
      });
      //console.log('check investmentTypes:', response.data);
      // Process the data to ensure proper handling of serialized Maps
      return process_serialized_data(response.data);
    } catch (error) {
      console.error('Error creating YAML scenario:', error);
      throw error;
    }
  },
};

export default scenarioYAMLService;
