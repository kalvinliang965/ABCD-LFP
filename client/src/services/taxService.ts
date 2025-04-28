// AI-generated code
// Add a service to check if state tax brackets exist for a given state

import { StateType } from '../types/Enum';
import axios from 'axios';
import { API_URL } from './api';

/**
 * Checks if state tax brackets exist in the database for the given state
 * @param state The state to check
 * @returns Promise that resolves to true if tax brackets exist, false otherwise
 */
export const check_state_tax_exists = async (state: StateType): Promise<boolean> => {
  try {
    console.log('Checking if state tax brackets exist for:', state);
    const response = await axios.get(`${API_URL}/tax/${state}`);
    return response.data.exists;
  } catch (error) {
    console.error('Error checking if state tax brackets exist:', error);
    return false;
  }
};
