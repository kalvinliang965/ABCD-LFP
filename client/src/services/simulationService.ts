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

// Type definitions for simulation results
export interface SimulationResultData {
  _id: string;
  scenarioId: string;
  userId: string;
  successProbability: number;
  years: number[];
  startYear: number;
  endYear: number;
  investments: Array<{
    name: string;
    category: 'investment';
    taxStatus?: 'non-retirement' | 'pre-tax' | 'after-tax';
    values: number[];
  }>;
  income: Array<{
    name: string;
    category: 'income';
    values: number[];
  }>;
  expenses: Array<{
    name: string;
    category: 'expense';
    values: number[];
  }>;
  totalInvestments?: {
    median: number[];
    ranges: {
      range10_90: number[][];
      range20_80: number[][];
      range30_70: number[][];
      range40_60: number[][];
    };
  };
  totalExpenses?: {
    median: number[];
    ranges: {
      range10_90: number[][];
      range20_80: number[][];
      range30_70: number[][];
      range40_60: number[][];
    };
  };
  totalIncome?: {
    median: number[];
    ranges: {
      range10_90: number[][];
      range20_80: number[][];
      range30_70: number[][];
      range40_60: number[][];
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data: SimulationResultData | SimulationResultData[];
  count?: number;
  simulationId?: string;
}

export const simulation_service = {
  // Run a simulation with the given scenario ID and count
  run_simulation: async (scenario_id: string, simulation_count: number) => {
    try {
      console.log("Running simulation for scenario:", scenario_id);
      const response = await axios_instance.post(SIMULATION_ENDPOINT, {
        scenarioId: scenario_id,
        count: simulation_count,
      });
      
      // Return the response data, which should now include simulationId
      return {
        success: response.data.success,
        simulationId: response.data.simulationId,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error running simulation:', error);
      throw error;
    }
  },

  // Get simulation results for a specific simulation by ID
  get_simulation_results: async (simulation_id: string): Promise<ApiResponse> => {
    try {
      const response = await axios_instance.get(`${SIMULATION_ENDPOINT}/${simulation_id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching simulation results:', error);
      throw error;
    }
  },

  // Get all simulations for the current user
  get_all_simulations: async (): Promise<ApiResponse> => {
    try {
      const response = await axios_instance.get(SIMULATION_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching simulations:', error);
      throw error;
    }
  },
  
  // Get all simulations for a specific scenario
  get_simulations_by_scenario: async (scenario_id: string): Promise<ApiResponse> => {
    try {
      console.log(`Fetching simulations for scenario ${scenario_id}`);
      const response = await axios_instance.get(`${SIMULATION_ENDPOINT}/scenario/${scenario_id}`);
      console.log('API response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error fetching simulations for scenario ${scenario_id}:`, error);
      throw error;
    }
  }
};

export default simulation_service;
