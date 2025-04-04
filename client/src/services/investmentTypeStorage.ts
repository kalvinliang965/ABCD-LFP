// AI-generated code
// Create a new localStorage service for investment types

import { InvestmentTypeRaw } from "../types/Scenarios";

// Local storage key
const STORAGE_KEY = "investment_types";

// Helper function to convert Map objects to plain objects for storage
function map_to_storage_object(investmentType: InvestmentTypeRaw): any {
  const clonedType = { ...investmentType };

  // No conversion needed for array-based distributions - they can be directly serialized
  return clonedType;
}

// Helper function to convert stored objects back to proper format with Maps
function object_to_investment_type(storedData: any): InvestmentTypeRaw {
  const baseConversion = {
    ...storedData,
  };

  // Arrays are already properly handled by JSON.parse()
  return baseConversion;
}

/**
 * Investment type storage service using localStorage
 */
export const investmentTypeStorage = {
  /**
   * Get all investment types from localStorage
   * @returns Array of investment types
   */
  get_all: (): InvestmentTypeRaw[] => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return [];

      const parsedData = JSON.parse(storedData);
      return Array.isArray(parsedData)
        ? parsedData.map(object_to_investment_type)
        : [];
    } catch (error) {
      console.error(
        "Error fetching investment types from localStorage:",
        error
      );
      return [];
    }
  },

  /**
   * Get an investment type by ID
   * @param id Investment type ID
   * @returns Investment type if found, null otherwise
   */
  get_by_id: (id: string): InvestmentTypeRaw | null => {
    try {
      const allTypes = investmentTypeStorage.get_all();
      const foundType = allTypes.find((type: any) => type.id === id);
      return foundType || null;
    } catch (error) {
      console.error(`Error fetching investment type with id ${id}:`, error);
      return null;
    }
  },

  /**
   * Add a new investment type to localStorage
   * @param investmentType Investment type data
   * @returns The created investment type with ID
   */
  create: (investmentType: InvestmentTypeRaw): InvestmentTypeRaw => {
    try {
      // Get current data
      const currentData = investmentTypeStorage.get_all();

      //check if name is already taken
      const nameExists = currentData.some(
        (type: InvestmentTypeRaw) => type.name === investmentType.name
      );
      if (nameExists) {
        throw new Error("Investment type name already exists");
      }

      // Add new type
      const newData = [...currentData, investmentType];

      // Convert for storage
      const storageData = newData.map(map_to_storage_object);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

      return investmentType;
    } catch (error) {
      console.error("Error creating investment type in localStorage:", error);
      throw error;
    }
  },

  /**
   * Update an existing investment type
   * @param id ID of the investment type to update
   * @param investmentType Updated investment type data
   * @returns The updated investment type
   */
  update: (
    name: string,
    investmentType: InvestmentTypeRaw
  ): InvestmentTypeRaw | null => {
    try {
      const currentData = investmentTypeStorage.get_all();
      const index = currentData.findIndex((type: any) => type.name === name);

      if (index === -1) return null;

      // Update the item
      const updatedType = {
        ...investmentType,
      };

      currentData[index] = updatedType;

      // Convert and save to localStorage
      const storageData = currentData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

      return updatedType;
    } catch (error) {
      console.error(`Error updating investment type with name ${name}:`, error);
      return null;
    }
  },

  /**
   * Delete an investment type
   * @param name Name of the investment type to delete
   * @returns true if deleted, false otherwise
   */
  delete: (name: string): boolean => {
    try {
      const currentData = investmentTypeStorage.get_all();
      const filteredData = currentData.filter((type: any) => type.name !== name);

      if (filteredData.length === currentData.length) {
        return false; // Nothing was deleted
      }

      // Convert and save to localStorage
      const storageData = filteredData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

      return true;
    } catch (error) {
      console.error(`Error deleting investment type with name ${name}:`, error);
      return false;
    }
  },

  /**
   * Clear all investment types from localStorage
   */
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error(
        "Error clearing investment types from localStorage:",
        error
      );
    }
  },
};

export default investmentTypeStorage;
