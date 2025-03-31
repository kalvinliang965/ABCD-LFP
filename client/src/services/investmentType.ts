import axios from "axios";
import { InvestmentType } from "../types/investmentTypes";
import { API_URL } from "./api";

// 投资类型API端点 - 修改为正确的端点
const INVESTMENT_TYPE_ENDPOINT = `${API_URL}/investmentTypes`;

function map_to_frontend_model(serverData: any): InvestmentType {
  // Convert date strings to Date objects
  const baseConversion = {
    ...serverData,
    createdAt: serverData.createdAt
      ? new Date(serverData.createdAt)
      : undefined,
    updatedAt: serverData.updatedAt
      ? new Date(serverData.updatedAt)
      : undefined,
  };

  // Convert returnDistribution from plain object to Map
  if (
    baseConversion.returnDistribution &&
    typeof baseConversion.returnDistribution === "object" &&
    !(baseConversion.returnDistribution instanceof Map)
  ) {
    const returnDistMap = new Map<string, any>();
    Object.entries(baseConversion.returnDistribution).forEach(
      ([key, value]) => {
        returnDistMap.set(key, value);
      }
    );
    baseConversion.returnDistribution = returnDistMap;
  }

  // Convert incomeDistribution from plain object to Map
  if (
    baseConversion.incomeDistribution &&
    typeof baseConversion.incomeDistribution === "object" &&
    !(baseConversion.incomeDistribution instanceof Map)
  ) {
    const incomeDistMap = new Map<string, any>();
    Object.entries(baseConversion.incomeDistribution).forEach(
      ([key, value]) => {
        incomeDistMap.set(key, value);
      }
    );
    baseConversion.incomeDistribution = incomeDistMap;
  }

  return baseConversion;
}

/**
 * Converts Map objects to plain JavaScript objects for API serialization
 * @param data Object containing Map properties
 * @returns The same object with Maps converted to plain objects
 */
function map_to_backend_model(investmentType: InvestmentType): any {
  // Clone the investment type to avoid modifying the original
  const clonedType = { ...investmentType };

  // Convert returnDistribution Map to plain object
  if (clonedType.returnDistribution) {
    if (clonedType.returnDistribution instanceof Map) {
      const returnDistObj: any = {};
      clonedType.returnDistribution.forEach((value, key) => {
        returnDistObj[key] = value;
      });
      clonedType.returnDistribution = returnDistObj;
    } else if (
      typeof clonedType.returnDistribution === "object" &&
      !Array.isArray(clonedType.returnDistribution)
    ) {
      // If it's already an object, leave it as is
      // This handles cases where the returnDistribution might already be an object
    }
  }

  // Convert incomeDistribution Map to plain object
  if (clonedType.incomeDistribution) {
    if (clonedType.incomeDistribution instanceof Map) {
      const incomeDistObj: any = {};
      clonedType.incomeDistribution.forEach((value, key) => {
        incomeDistObj[key] = value;
      });
      clonedType.incomeDistribution = incomeDistObj;
    } else if (
      typeof clonedType.incomeDistribution === "object" &&
      !Array.isArray(clonedType.incomeDistribution)
    ) {
      // If it's already an object, leave it as is
      // This handles cases where the incomeDistribution might already be an object
    }
  }

  return clonedType;
}

/**
 * Investment type API service
 */
export const investmentTypeApi = {
  /**
   * Get all investment types
   * @returns Promise with array of investment types
   */
  getAll: async (): Promise<InvestmentType[]> => {
    try {
      const response = await axios.get(INVESTMENT_TYPE_ENDPOINT);
      return response.data.map(map_to_frontend_model);
    } catch (error) {
      console.error("Error fetching investment types:", error);
      throw error;
    }
  },

  /**
   * Get an investment type by ID
   * @param id Investment type ID
   * @returns Promise with the investment type
   */
  getById: async (id: string): Promise<InvestmentType> => {
    try {
      const response = await axios.get(`${INVESTMENT_TYPE_ENDPOINT}/${id}`);
      return map_to_frontend_model(response.data);
    } catch (error) {
      console.error(`Error fetching investment type with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new investment type
   * @param investment Investment type data
   * @returns Promise with the created investment type
   */
  create: async (investmentType: InvestmentType): Promise<InvestmentType> => {
    try {
      // Convert Map objects to plain objects for API serialization
      const backendData = map_to_backend_model(investmentType);

      console.log("backendData", backendData);

      // Send to API
      const response = await axios.post(INVESTMENT_TYPE_ENDPOINT, backendData);

      // Convert the response back to frontend model
      return map_to_frontend_model(response.data);
    } catch (error) {
      console.error("Error creating investment type:", error);
      throw error;
    }
  },
};

export default investmentTypeApi;
