import axios from 'axios';

import { ScenarioRaw } from '../types/Scenarios';

import { API_URL } from './api';
// AI-generated code
// Import serialization utility to handle Set objects in API calls

const YAML_ENDPOINT = `${API_URL}/yaml`;

// AI-generated code
// Helper function to get the JWT token from localStorage
function get_auth_token() {
  return localStorage.getItem('token');
}

// AI-generated code
// Create axios instance with default headers including YAML content type
const axios_instance = axios.create({
  headers: {
    'Content-Type': 'application/x-yaml',
  },
  withCredentials: true,
});

// AI-generated code
// Add request interceptor for JWT token
axios_instance.interceptors.request.use(
  config => {
    const token = get_auth_token();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

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
      // Using the authenticated axios instance to send the YAML content
      const response = await axios_instance.post(YAML_ENDPOINT, yaml);

      // Process the data to ensure proper handling of serialized Maps
      const processedData = process_serialized_data(response.data.data || response.data);

      return processedData;
    } catch (error) {
      console.error('Error creating YAML scenario:', error);
      throw error;
    }
  },
};

export default scenarioYAMLService;
