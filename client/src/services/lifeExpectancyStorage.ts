// Local storage service for life expectancy settings
import { LifeExpectancyConfig } from '../components/scenarios/LifeExpectancyForm';

// Local storage key
const STORAGE_KEY = 'life_expectancy_settings';

// Helper function to convert complex objects for storage
function map_to_storage_object(config: LifeExpectancyConfig): any {
  const clonedConfig = JSON.parse(JSON.stringify(config));
  // Add any transformations needed for storage
  return clonedConfig;
}

// Helper function to convert stored objects back to proper format
function object_to_life_expectancy_config(storedData: any): LifeExpectancyConfig {
  return {
    id: storedData.id,
    userExpectancyType: storedData.userExpectancyType || 'fixed',
    userFixedAge: storedData.userFixedAge || 85,
    userMeanAge: storedData.userMeanAge || 85,
    userStandardDeviation: storedData.userStandardDeviation || 5,
    spouseExpectancyType: storedData.spouseExpectancyType || 'fixed',
    spouseFixedAge: storedData.spouseFixedAge || 85,
    spouseMeanAge: storedData.spouseMeanAge || 85,
    spouseStandardDeviation: storedData.spouseStandardDeviation || 5,
  };
}

// Generate a unique ID
function generate_id(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * Life expectancy storage service using localStorage
 */
export const lifeExpectancyStorage = {
  /**
   * Get all life expectancy configs from localStorage
   */
  get_all: (): LifeExpectancyConfig[] => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return [];

      const parsedData = JSON.parse(storedData);
      return Array.isArray(parsedData) ? parsedData.map(object_to_life_expectancy_config) : [];
    } catch (error) {
      console.error('Error fetching life expectancy configs from localStorage:', error);
      return [];
    }
  },

  /**
   * Get a life expectancy config by ID
   */
  get_by_id: (id: string): LifeExpectancyConfig | null => {
    try {
      const configs = lifeExpectancyStorage.get_all();
      const config = configs.find((s: any) => s.id === id);
      return config || null;
    } catch (error) {
      console.error(`Error fetching life expectancy config with id ${id}:`, error);
      return null;
    }
  },

  /**
   * Add a new life expectancy config to localStorage
   */
  add: (config: LifeExpectancyConfig): LifeExpectancyConfig => {
    try {
      const configs = lifeExpectancyStorage.get_all();

      // Generate ID if not provided
      const configWithId = {
        ...config,
        id: config.id || generate_id(),
      };

      // Add to array
      configs.push(map_to_storage_object(configWithId));

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));

      return configWithId;
    } catch (error) {
      console.error('Error adding life expectancy config to localStorage:', error);
      throw error;
    }
  },

  /**
   * Update an existing life expectancy config in localStorage
   */
  update: (id: string, config: LifeExpectancyConfig): LifeExpectancyConfig => {
    try {
      const configs = lifeExpectancyStorage.get_all();
      const index = configs.findIndex((s: any) => s.id === id);

      if (index === -1) {
        throw new Error(`Life expectancy config with id ${id} not found`);
      }

      // Update the config
      const updatedConfig = {
        ...config,
        id,
      };

      configs[index] = map_to_storage_object(updatedConfig);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));

      return updatedConfig;
    } catch (error) {
      console.error(`Error updating life expectancy config with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a life expectancy config from localStorage
   */
  delete: (id: string): void => {
    try {
      const configs = lifeExpectancyStorage.get_all();
      const filteredConfigs = configs.filter((s: any) => s.id !== id);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredConfigs));
    } catch (error) {
      console.error(`Error deleting life expectancy config with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Clear all life expectancy configs from localStorage
   */
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing life expectancy configs from localStorage:', error);
    }
  },

  /**
   * Get the most recent life expectancy config
   */
  getMostRecent: (): LifeExpectancyConfig | null => {
    try {
      const configs = lifeExpectancyStorage.get_all();
      if (configs.length === 0) return null;

      return configs[configs.length - 1];
    } catch (error) {
      console.error('Error getting most recent life expectancy config:', error);
      return null;
    }
  },
};

export default lifeExpectancyStorage;
