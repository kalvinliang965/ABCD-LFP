// Local storage service for withdrawal strategies
import { WithdrawalStrategy } from "../components/scenarios/WithdrawalStrategyForm";

// Local storage key
const STORAGE_KEY = "withdrawal_strategies";

// Helper function to convert complex objects for storage
function map_to_storage_object(withdrawalStrategy: WithdrawalStrategy): any {
  const clonedStrategy = JSON.parse(JSON.stringify(withdrawalStrategy));
  // Add any transformations needed for storage
  return clonedStrategy;
}

// Helper function to convert stored objects back to proper format
function object_to_withdrawal_strategy(storedData: any): WithdrawalStrategy {
  // If we have the full object stored, use it
  if (storedData.fullObject) {
    return {
      ...storedData.fullObject,
      id: storedData.id
    };
  }
  
  // Otherwise reconstruct from the simplified format
  return {
    id: storedData.id,
    accountPriority: storedData.accountPriority || [],
    availableAccounts: storedData.availableAccounts || []
  };
}

// Generate a unique ID
function generate_id(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * Withdrawal strategy storage service using localStorage
 */
export const withdrawalStrategyStorage = {
  /**
   * Get all withdrawal strategies from localStorage
   */
  get_all: (): WithdrawalStrategy[] => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return [];

      const parsedData = JSON.parse(storedData);
      return Array.isArray(parsedData)
        ? parsedData.map(object_to_withdrawal_strategy)
        : [];
    } catch (error) {
      console.error("Error fetching withdrawal strategies from localStorage:", error);
      return [];
    }
  },

  /**
   * Get a withdrawal strategy by ID
   */
  get_by_id: (id: string): WithdrawalStrategy | null => {
    try {
      const strategies = withdrawalStrategyStorage.get_all();
      const strategy = strategies.find((s: any) => s.id === id);
      return strategy || null;
    } catch (error) {
      console.error(`Error fetching withdrawal strategy with id ${id}:`, error);
      return null;
    }
  },

  /**
   * Add a new withdrawal strategy
   */
  add: (withdrawalStrategy: WithdrawalStrategy): WithdrawalStrategy => {
    try {
      const currentData = withdrawalStrategyStorage.get_all();
      
      // Generate a new ID if one doesn't exist
      const id = withdrawalStrategy.id || generate_id();
      
      // Create the new strategy with ID
      const newStrategy = {
        ...withdrawalStrategy,
        id,
      };
      
      // Add to current data
      currentData.push(newStrategy);
      
      // Convert and save to localStorage
      const storageData = currentData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      
      return newStrategy;
    } catch (error) {
      console.error("Error adding withdrawal strategy to localStorage:", error);
      throw error;
    }
  },

  /**
   * Update an existing withdrawal strategy
   */
  update: (id: string, withdrawalStrategy: WithdrawalStrategy): WithdrawalStrategy | null => {
    try {
      const currentData = withdrawalStrategyStorage.get_all();
      const index = currentData.findIndex((s: any) => s.id === id);
      
      if (index === -1) {
        console.error(`Withdrawal strategy with id ${id} not found`);
        return null;
      }
      
      // Update the strategy
      const updatedStrategy = {
        ...withdrawalStrategy,
        id,
      };
      
      currentData[index] = updatedStrategy;
      
      // Convert and save to localStorage
      const storageData = currentData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      
      return updatedStrategy;
    } catch (error) {
      console.error(`Error updating withdrawal strategy with id ${id}:`, error);
      return null;
    }
  },

  /**
   * Delete a withdrawal strategy
   */
  delete: (id: string): boolean => {
    try {
      const currentData = withdrawalStrategyStorage.get_all();
      const filteredData = currentData.filter((s: any) => s.id !== id);
      
      if (filteredData.length === currentData.length) {
        return false; // Nothing was deleted
      }
      
      // Convert and save to localStorage
      const storageData = filteredData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      
      return true;
    } catch (error) {
      console.error(`Error deleting withdrawal strategy with id ${id}:`, error);
      return false;
    }
  },

  /**
   * Clear all withdrawal strategies from localStorage
   */
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing withdrawal strategies from localStorage:", error);
    }
  },

  /**
   * Get just the account priority array
   */
  getSimplifiedWithdrawalStrategy: (id: string): string[] => {
    try {
      const strategy = withdrawalStrategyStorage.get_by_id(id);
      return strategy ? strategy.accountPriority : [];
    } catch (error) {
      console.error("Error getting simplified withdrawal strategy:", error);
      return [];
    }
  },

  /**
   * Get the most recent simplified withdrawal strategy
   */
  getMostRecentSimplifiedWithdrawalStrategy: (): string[] => {
    try {
      const strategies = withdrawalStrategyStorage.get_all();
      if (strategies.length === 0) return [];
      
      return strategies[strategies.length - 1].accountPriority;
    } catch (error) {
      console.error("Error getting most recent simplified withdrawal strategy:", error);
      return [];
    }
  },
};

export default withdrawalStrategyStorage; 