// AI-generated code
// Create a service for handling simulation-related API calls

import axios from 'axios';

import { API_URL } from './api';

const SIMULATION_ENDPOINT = `${API_URL}/simulations`;

// Helper function to get the JWT token from localStorage
const get_auth_token = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default headers
const axios_instance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

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

export const simulation_service = {
  // Run a simulation with the given scenario ID and count
  run_simulation: async (scenario_id: string, simulation_count: number) => {
    try {
      console.log("Running simulation for scenario:", scenario_id);
      const response = await axios_instance.post(SIMULATION_ENDPOINT, {
        scenarioId: scenario_id,
        count: simulation_count,
      });
      return response.data;
    } catch (error) {
      console.error('Error running simulation:', error);
      throw error;
    }
  },

  // Get simulation results for a specific simulation
  get_simulation_results: async (simulation_id: string) => {
    try {
      const response = await axios_instance.get(`${SIMULATION_ENDPOINT}/${simulation_id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching simulation results:', error);
      throw error;
    }
  },

  // Get all simulations for the current user
  get_all_simulations: async () => {
    try {
      const response = await axios_instance.get(SIMULATION_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching simulations:', error);
      throw error;
    }
  },
};

export default simulation_service;
