// Local storage service for RMD strategies
import { RMDSettings } from "../components/scenarios/RMDSettingsForm";

// Local storage key
const STORAGE_KEY = "rmd_strategies";

// Helper function to convert complex objects for storage
function map_to_storage_object(rmdSettings: RMDSettings): any {
  const clonedSettings = JSON.parse(JSON.stringify(rmdSettings));
  // Add any transformations needed for storage
  return clonedSettings;
}

// Helper function to convert stored objects back to proper format
function object_to_rmd_settings(storedData: any): RMDSettings {
  return {
    id: storedData.id,
    enableRMD: storedData.enableRMD !== undefined ? storedData.enableRMD : true,
    startAge: storedData.startAge || 72,
    accountPriority: storedData.accountPriority || [],
    availableAccounts: storedData.availableAccounts || []
  };
}

// Generate a unique ID
function generate_id(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * RMD strategy storage service using localStorage
 */
export const rmdStrategyStorage = {
  /**
   * Get all RMD strategies from localStorage
   */
  get_all: (): RMDSettings[] => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return [];

      const parsedData = JSON.parse(storedData);
      return Array.isArray(parsedData)
        ? parsedData.map(object_to_rmd_settings)
        : [];
    } catch (error) {
      console.error("Error fetching RMD strategies from localStorage:", error);
      return [];
    }
  },

  /**
   * Get a RMD strategy by ID
   */
  get_by_id: (id: string): RMDSettings | null => {
    try {
      const strategies = rmdStrategyStorage.get_all();
      const strategy = strategies.find((s: any) => s.id === id);
      return strategy || null;
    } catch (error) {
      console.error(`Error fetching RMD strategy with id ${id}:`, error);
      return null;
    }
  },

  /**
   * Add a new RMD strategy
   */
  add: (rmdSettings: RMDSettings): RMDSettings => {
    try {
      const currentData = rmdStrategyStorage.get_all();
      
      // Generate a new ID if one doesn't exist
      const id = rmdSettings.id || generate_id();
      
      // Create the new strategy with ID
      const newStrategy = {
        ...rmdSettings,
        id,
      };
      
      // Add to current data
      currentData.push(newStrategy);
      
      // Convert and save to localStorage
      const storageData = currentData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      
      return newStrategy;
    } catch (error) {
      console.error("Error adding RMD strategy to localStorage:", error);
      throw error;
    }
  },

  /**
   * Update an existing RMD strategy
   */
  update: (id: string, rmdSettings: RMDSettings): RMDSettings | null => {
    try {
      const currentData = rmdStrategyStorage.get_all();
      const index = currentData.findIndex((s: any) => s.id === id);
      
      if (index === -1) {
        console.error(`RMD strategy with id ${id} not found`);
        return null;
      }
      
      // Update the strategy
      const updatedStrategy = {
        ...rmdSettings,
        id,
      };
      
      currentData[index] = updatedStrategy;
      
      // Convert and save to localStorage
      const storageData = currentData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      
      return updatedStrategy;
    } catch (error) {
      console.error(`Error updating RMD strategy with id ${id}:`, error);
      return null;
    }
  },

  /**
   * Delete a RMD strategy
   */
  delete: (id: string): boolean => {
    try {
      const currentData = rmdStrategyStorage.get_all();
      const filteredData = currentData.filter((s: any) => s.id !== id);
      
      if (filteredData.length === currentData.length) {
        return false; // Nothing was deleted
      }
      
      // Convert and save to localStorage
      const storageData = filteredData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      
      return true;
    } catch (error) {
      console.error(`Error deleting RMD strategy with id ${id}:`, error);
      return false;
    }
  },

  /**
   * Clear all RMD strategies from localStorage
   */
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing RMD strategies from localStorage:", error);
    }
  },

  /**
   * Get the simplified RMD strategy (just the account priority array)
   */
  getSimplifiedRMDStrategy: (id: string): string[] => {
    try {
      const strategy = rmdStrategyStorage.get_by_id(id);
      return strategy && strategy.enableRMD ? strategy.accountPriority : [];
    } catch (error) {
      console.error("Error getting simplified RMD strategy:", error);
      return [];
    }
  },

  /**
   * Get the most recent simplified RMD strategy
   */
  getMostRecentSimplifiedRMDStrategy: (): string[] => {
    try {
      const strategies = rmdStrategyStorage.get_all();
      if (strategies.length === 0) return [];
      
      const mostRecent = strategies[strategies.length - 1];
      return mostRecent.enableRMD ? mostRecent.accountPriority : [];
    } catch (error) {
      console.error("Error getting most recent simplified RMD strategy:", error);
      return [];
    }
  },
};

export default rmdStrategyStorage;