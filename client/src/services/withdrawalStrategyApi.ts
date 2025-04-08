import axios from "axios";
import { API_URL } from "./api";
import { WithdrawalStrategy } from "../components/scenarios/WithdrawalStrategyForm";

// API endpoint for withdrawal strategies
const WITHDRAWAL_STRATEGY_ENDPOINT = `${API_URL}/withdrawalStrategies`;

/**
 * Converts frontend withdrawal strategy model to backend format
 */
function map_to_backend_model(withdrawalStrategy: WithdrawalStrategy): any {
  // Create a deep clone to avoid modifying the original
  const clonedStrategy = JSON.parse(JSON.stringify(withdrawalStrategy));
  
  // Add any specific transformations needed for the backend
  
  return clonedStrategy;
}

/**
 * Converts backend withdrawal strategy model to frontend format
 */
function map_to_frontend_model(serverData: any): WithdrawalStrategy {
  // Create a base conversion with all properties
  const baseConversion = {
    ...serverData,
    createdAt: serverData.createdAt ? new Date(serverData.createdAt) : undefined,
    updatedAt: serverData.updatedAt ? new Date(serverData.updatedAt) : undefined,
  };
  
  // Add any specific transformations needed for the frontend
  
  return baseConversion;
}

/**
 * Withdrawal strategy API service
 */
export const withdrawalStrategyApi = {
  /**
   * Get all withdrawal strategies
   */
  getAll: async (): Promise<WithdrawalStrategy[]> => {
    try {
      const response = await axios.get(WITHDRAWAL_STRATEGY_ENDPOINT, {
        withCredentials: true
      });
      return response.data.map(map_to_frontend_model);
    } catch (error) {
      console.error("Error fetching withdrawal strategies:", error);
      throw error;
    }
  },

  /**
   * Get a withdrawal strategy by ID
   */
  getById: async (id: string): Promise<WithdrawalStrategy> => {
    try {
      const response = await axios.get(`${WITHDRAWAL_STRATEGY_ENDPOINT}/${id}`, {
        withCredentials: true
      });
      return map_to_frontend_model(response.data);
    } catch (error) {
      console.error(`Error fetching withdrawal strategy with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new withdrawal strategy
   */
  create: async (withdrawalStrategy: WithdrawalStrategy): Promise<WithdrawalStrategy> => {
    try {
      const backendData = map_to_backend_model(withdrawalStrategy);
      const response = await axios.post(WITHDRAWAL_STRATEGY_ENDPOINT, backendData, {
        withCredentials: true
      });
      return map_to_frontend_model(response.data);
    } catch (error) {
      console.error("Error creating withdrawal strategy:", error);
      throw error;
    }
  },

  /**
   * Update an existing withdrawal strategy
   */
  update: async (id: string, withdrawalStrategy: WithdrawalStrategy): Promise<WithdrawalStrategy> => {
    try {
      const backendData = map_to_backend_model(withdrawalStrategy);
      const response = await axios.put(`${WITHDRAWAL_STRATEGY_ENDPOINT}/${id}`, backendData, {
        withCredentials: true
      });
      return map_to_frontend_model(response.data);
    } catch (error) {
      console.error(`Error updating withdrawal strategy with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a withdrawal strategy
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${WITHDRAWAL_STRATEGY_ENDPOINT}/${id}`, {
        withCredentials: true
      });
      return true;
    } catch (error) {
      console.error(`Error deleting withdrawal strategy with id ${id}:`, error);
      return false;
    }
  }
};

export default withdrawalStrategyApi; 