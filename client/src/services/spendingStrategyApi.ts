import axios from "axios";
import { API_URL } from "./api";
import { SpendingStrategy } from "../components/scenarios/SpendingStrategyForm";

// API endpoint for spending strategies
const SPENDING_STRATEGY_ENDPOINT = `${API_URL}/spendingStrategies`;

/**
 * Converts frontend spending strategy model to backend format
 * Similar to the approach used in investmentType.ts
 */
function map_to_backend_model(spendingStrategy: SpendingStrategy): any {
  // Create a deep clone to avoid modifying the original
  const clonedStrategy = JSON.parse(JSON.stringify(spendingStrategy));
  
  // Add any specific transformations needed for the backend
  // For example, if you need to convert any complex data structures
  
  return clonedStrategy;
}

/**
 * Converts backend spending strategy model to frontend format
 * Similar to the approach used in investmentType.ts
 */
function map_to_frontend_model(serverData: any): SpendingStrategy {
  // Create a base conversion with all properties
  const baseConversion = {
    ...serverData,
    createdAt: serverData.createdAt ? new Date(serverData.createdAt) : undefined,
    updatedAt: serverData.updatedAt ? new Date(serverData.updatedAt) : undefined,
  };
  
  // Add any specific transformations needed for the frontend
  // For example, if you need to convert any complex data structures
  
  return baseConversion;
}

/**
 * Spending strategy API service
 */
export const spendingStrategyApi = {
  /**
   * Get all spending strategies
   */
  getAll: async (): Promise<SpendingStrategy[]> => {
    try {
      const response = await axios.get(SPENDING_STRATEGY_ENDPOINT, {
        withCredentials: true
      });
      return response.data.map(map_to_frontend_model);
    } catch (error) {
      console.error("Error fetching spending strategies:", error);
      throw error;
    }
  },

  /**
   * Get a spending strategy by ID
   */
  getById: async (id: string): Promise<SpendingStrategy> => {
    try {
      const response = await axios.get(`${SPENDING_STRATEGY_ENDPOINT}/${id}`, {
        withCredentials: true
      });
      return map_to_frontend_model(response.data);
    } catch (error) {
      console.error(`Error fetching spending strategy with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new spending strategy
   */
  create: async (spendingStrategy: SpendingStrategy): Promise<SpendingStrategy> => {
    try {
      const backendData = map_to_backend_model(spendingStrategy);
      const response = await axios.post(SPENDING_STRATEGY_ENDPOINT, backendData, {
        withCredentials: true
      });
      return map_to_frontend_model(response.data);
    } catch (error) {
      console.error("Error creating spending strategy:", error);
      throw error;
    }
  },

  /**
   * Update an existing spending strategy
   */
  update: async (id: string, spendingStrategy: SpendingStrategy): Promise<SpendingStrategy> => {
    try {
      const backendData = map_to_backend_model(spendingStrategy);
      const response = await axios.put(`${SPENDING_STRATEGY_ENDPOINT}/${id}`, backendData, {
        withCredentials: true
      });
      return map_to_frontend_model(response.data);
    } catch (error) {
      console.error(`Error updating spending strategy with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a spending strategy
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${SPENDING_STRATEGY_ENDPOINT}/${id}`, {
        withCredentials: true
      });
      return true;
    } catch (error) {
      console.error(`Error deleting spending strategy with id ${id}:`, error);
      return false;
    }
  }
};

export default spendingStrategyApi; 