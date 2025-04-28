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
  startYear: number;
  endYear: number;
  
  // New year-based data structure
  yearlyData: Array<{
    year: number;
    
    // Investment data
    total_after_tax: number;
    total_pre_tax: number;
    total_non_retirement: number;
    is_goal_met: boolean;
    cash_value: number;
    investments: Record<string, number>;
    
    // Income data
    cur_year_income: number;
    cur_year_social_security: number;
    cur_year_capital_gains: number;
    cur_year_after_tax_contributions: number;
    cur_year_early_withdrawals: number;
    income_breakdown: Record<string, number>;
    
    // Expense data
    mandatory_expenses: number;
    discretionary_expenses: number;
    total_expenses: number;
    expense_breakdown: {
      expenses: Record<string, number>;
      taxes: number;
    };
    
    // Statistical data (optional)
    stats?: {
      totalInvestments?: {
        median: number;
        ranges: {
          range10_90: [number, number];
          range20_80: [number, number];
          range30_70: [number, number];
          range40_60: [number, number];
        }
      };
      totalIncome?: {
        median: number;
        ranges: {
          range10_90: [number, number];
          range20_80: [number, number];
          range30_70: [number, number];
          range40_60: [number, number];
        }
      };
      totalExpenses?: {
        median: number;
        ranges: {
          range10_90: [number, number];
          range20_80: [number, number];
          range30_70: [number, number];
          range40_60: [number, number];
        }
      };
    }
  }>;
  
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
