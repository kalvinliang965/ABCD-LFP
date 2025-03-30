import axios from "axios";
import { Investment } from "../types/investment";
import { config } from "../config";

// API base URL
//! Need help!!!!!!
const API_URL =
  import.meta.env.VITE_API_URL || `http://localhost:${config.apiPrefix}/api`;

/**
 * Map frontend Investment model to backend InvestmentType model
 */
export const mapToBackendModel = (investment: any) => {
  console.log("正在尝试mapToBackendModel");
  return {
    name: investment.name,
    description: investment.description,
    expectedAnnualReturn: {
      mode: investment.returnType === "normal" ? "NORMAL" : "UNIFORM",
      value:
        investment.returnType === "fixed"
          ? investment.returnRate / 100
          : undefined,
      mean:
        investment.returnType === "normal"
          ? investment.returnRate / 100
          : undefined,
      stdDev:
        investment.returnType === "normal"
          ? investment.returnRateStdDev / 100
          : undefined,
      isPercentage: investment.returnInputMode === "percentage",
    },
    expenseRatio: investment.expenseRatio / 100, // Convert from percentage to decimal
    expectedAnnualIncome: {
      mode: investment.dividendType === "normal" ? "NORMAL" : "UNIFORM",
      value:
        investment.dividendType === "fixed"
          ? investment.dividendRate / 100
          : undefined,
      mean:
        investment.dividendType === "normal"
          ? investment.dividendRate / 100
          : undefined,
      stdDev:
        investment.dividendType === "normal"
          ? investment.dividendRateStdDev / 100
          : undefined,
      isPercentage: investment.dividendInputMode === "percentage",
    },
    taxability: investment.taxability === "taxable" ? "TAXABLE" : "TAX_EXEMPT",
  };
};

/**
 * Map backend InvestmentType model to frontend Investment model
 */
export const mapToFrontendModel = (backendInvestment: any): Investment => {
  return {
    id: backendInvestment._id,
    name: backendInvestment.name,
    description: backendInvestment.description || "",
    date: new Date(backendInvestment.createdAt).toISOString().split("T")[0],
    value: "$10,000", // Placeholder value
    returnType:
      backendInvestment.expectedAnnualReturn.mode === "normalDistribution"
        ? "normal"
        : "fixed",
    returnRate:
      backendInvestment.expectedAnnualReturn.mode === "fixed"
        ? backendInvestment.expectedAnnualReturn.value * 100
        : backendInvestment.expectedAnnualReturn.mean * 100,
    returnRateStdDev:
      backendInvestment.expectedAnnualReturn.mode === "normalDistribution"
        ? backendInvestment.expectedAnnualReturn.stdDev * 100
        : undefined,
    returnInputMode: backendInvestment.expectedAnnualReturn.isPercentage
      ? "percentage"
      : "fixed_amount",
    expenseRatio: backendInvestment.expenseRatio * 100, // Convert from decimal to percentage
    dividendType:
      backendInvestment.expectedAnnualIncome.mode === "normalDistribution"
        ? "normal"
        : "fixed",
    dividendRate:
      backendInvestment.expectedAnnualIncome.mode === "fixed"
        ? backendInvestment.expectedAnnualIncome.value * 100
        : backendInvestment.expectedAnnualIncome.mean * 100,
    dividendRateStdDev:
      backendInvestment.expectedAnnualIncome.mode === "normalDistribution"
        ? backendInvestment.expectedAnnualIncome.stdDev * 100
        : undefined,
    dividendInputMode: backendInvestment.expectedAnnualIncome.isPercentage
      ? "percentage"
      : "fixed_amount",
    taxability: backendInvestment.taxability as "taxable" | "tax-exempt",
    lastUpdated: new Date(backendInvestment.updatedAt).toLocaleString(),
  };
};

/**
 * Investment type API service
 */
export const investmentApi = {
  /**
   * Get all investment types
   * @returns Promise with array of investment types
   */
  getAll: async (): Promise<Investment[]> => {
    try {
      console.log("API_URL", API_URL);
      const response = await axios.get(`${API_URL}/investmentTypes`);
      console.log("response.data", response.data);
      return response.data.map(mapToFrontendModel);
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
  getById: async (id: string): Promise<Investment> => {
    try {
      const response = await axios.get(`${API_URL}/investmentTypes/${id}`);
      return mapToFrontendModel(response.data);
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
  create: async (investment: any): Promise<Investment> => {
    try {
      console.log("正在尝试create investment type");
      const backendModel = mapToBackendModel(investment);
      console.log("backendModel", backendModel);
      const response = await axios.post(
        `${API_URL}/investmentTypes`,
        backendModel
      );
      return mapToFrontendModel(response.data);
    } catch (error) {
      console.error("Error creating investment type:", error);
      throw error;
    }
  },
};

export default investmentApi;
