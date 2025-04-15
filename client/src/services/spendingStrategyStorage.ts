// Local storage service for spending strategies
import { SpendingStrategy } from '../components/scenarios/SpendingStrategyForm';

// Local storage key
const STORAGE_KEY = 'spending_strategies';

// Helper function to convert complex objects for storage
function map_to_storage_object(spendingStrategy: SpendingStrategy): any {
  const clonedStrategy = JSON.parse(JSON.stringify(spendingStrategy));
  // Add any transformations needed for storage
  return clonedStrategy;
}

// Helper function to convert stored objects back to proper format
function object_to_spending_strategy(storedData: any): SpendingStrategy {
  // If we have the full object stored, use it
  if (storedData.fullObject) {
    return {
      ...storedData.fullObject,
      id: storedData.id,
    };
  }

  // Otherwise reconstruct from the simplified format
  return {
    id: storedData.id,
    selectedExpenses: storedData.selectedExpenses || [],
    availableExpenses: storedData.availableExpenses || [],
  };
}

// Generate a unique ID
function generate_id(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * Spending strategy storage service using localStorage
 */
export const spendingStrategyStorage = {
  /**
   * Get all spending strategies from localStorage
   */
  get_all: (): SpendingStrategy[] => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return [];

      const parsedData = JSON.parse(storedData);
      return Array.isArray(parsedData) ? parsedData.map(object_to_spending_strategy) : [];
    } catch (error) {
      console.error('Error fetching spending strategies from localStorage:', error);
      return [];
    }
  },

  /**
   * Get a spending strategy by ID
   */
  get_by_id: (id: string): SpendingStrategy | null => {
    try {
      const strategies = spendingStrategyStorage.get_all();
      const strategy = strategies.find((s: any) => s.id === id);
      return strategy || null;
    } catch (error) {
      console.error(`Error fetching spending strategy with id ${id}:`, error);
      return null;
    }
  },

  /**
   * Add a new spending strategy
   */
  add: (spendingStrategy: SpendingStrategy): SpendingStrategy => {
    try {
      const currentData = spendingStrategyStorage.get_all();

      // Generate a new ID if one doesn't exist
      const id = spendingStrategy.id || generate_id();

      // Create the new strategy with ID
      const newStrategy = {
        ...spendingStrategy,
        id,
      };

      // Add to current data
      currentData.push(newStrategy);

      // Convert and save to localStorage
      const storageData = currentData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

      return newStrategy;
    } catch (error) {
      console.error('Error adding spending strategy to localStorage:', error);
      throw error;
    }
  },

  /**
   * Update an existing spending strategy
   */
  update: (id: string, spendingStrategy: SpendingStrategy): SpendingStrategy | null => {
    try {
      const currentData = spendingStrategyStorage.get_all();
      const index = currentData.findIndex((s: any) => s.id === id);

      if (index === -1) {
        console.error(`Spending strategy with id ${id} not found`);
        return null;
      }

      // Update the strategy
      const updatedStrategy = {
        ...spendingStrategy,
        id,
      };

      currentData[index] = updatedStrategy;

      // Convert and save to localStorage
      const storageData = currentData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

      return updatedStrategy;
    } catch (error) {
      console.error(`Error updating spending strategy with id ${id}:`, error);
      return null;
    }
  },

  /**
   * Delete a spending strategy
   */
  delete: (id: string): boolean => {
    try {
      const currentData = spendingStrategyStorage.get_all();
      const filteredData = currentData.filter((s: any) => s.id !== id);

      if (filteredData.length === currentData.length) {
        return false; // Nothing was deleted
      }

      // Convert and save to localStorage
      const storageData = filteredData.map(map_to_storage_object);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

      return true;
    } catch (error) {
      console.error(`Error deleting spending strategy with id ${id}:`, error);
      return false;
    }
  },

  /**
   * Clear all spending strategies from localStorage
   */
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing spending strategies from localStorage:', error);
    }
  },

  // Add this function to get just the selected expenses array
  getSimplifiedSpendingStrategy: (id: string): string[] => {
    try {
      const strategy = spendingStrategyStorage.get_by_id(id);
      return strategy ? strategy.selectedExpenses : [];
    } catch (error) {
      console.error('Error getting simplified spending strategy:', error);
      return [];
    }
  },

  // Add this function to get the most recent simplified spending strategy
  getMostRecentSimplifiedSpendingStrategy: (): string[] => {
    try {
      const strategies = spendingStrategyStorage.get_all();
      if (strategies.length === 0) return [];

      return strategies[strategies.length - 1].selectedExpenses;
    } catch (error) {
      console.error('Error getting most recent simplified spending strategy:', error);
      return [];
    }
  },
};

export default spendingStrategyStorage;
