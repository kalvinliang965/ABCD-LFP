//saving partial or complete scenario to db
import axios from 'axios';

import { API_URL } from './api';

const SCENARIO_ENDPOINT = `${API_URL}/scenarios`;

// Helper function to get the JWT token from localStorage
const get_auth_token = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default headers
const axios_instance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

//add request interceptor for JWT token
axios_instance.interceptors.request.use(
  config => {
    const token = get_auth_token();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const scenario_service = {
  //creating new scenario
  //send POST request with the scenario data and return the created one from the server
  create_scenario: async (scenario_data: any) => {
    try {
      const response = await axios_instance.post(SCENARIO_ENDPOINT, scenario_data);
      return response.data;
    } catch (error) {
      console.error('error creating scenario:', error);
      throw error;
    }
  },

  //for updating drafts or changes during form steps
  update_scenario: async (scenario_id: string, scenario_data: any) => {
    try {
      const response = await axios_instance.put(
        `${SCENARIO_ENDPOINT}/${scenario_id}`,
        scenario_data
      );
      return response.data;
    } catch (error) {
      console.error('error updating scenario:', error);
      throw error;
    }
  },

  ///get a single scenario by its ID
  //Needed for loading a scenario for editing or review
  get_scenario_by_id: async (scenario_id: string) => {
    try {
      const response = await axios_instance.get(`${SCENARIO_ENDPOINT}/${scenario_id}`);
      return response.data;
    } catch (error) {
      console.error('error fetching scenario by id:', error);
      throw error;
    }
  },

  //get draft scenarioS for the logged in user
  //?is_draft=true so that only draft scenarios are returned.
  // used to display unfinished drafts for user
  // when he choses to finish scenario instead of starting new
  get_draft_scenarios: async () => {
    try {
      const response = await axios_instance.get(`${SCENARIO_ENDPOINT}?is_draft=true`);
      return response.data;
    } catch (error) {
      console.error('error fetching drafts:', error);
      throw error;
    }
  },

  //get all scenarios, both drafts and completed for the dashboard
  get_all_scenarios: async () => {
    try {
      const response = await axios_instance.get(SCENARIO_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('error fetching scenarios:', error);
      throw error;
    }
  },

  //delete a scenario
  delete_scenario: async (scenario_id: string) => {
    try {
      await axios_instance.delete(`${SCENARIO_ENDPOINT}/${scenario_id}`);
    } catch (error) {
      console.error('error deleting scenario:', error);
      throw error;
    }
  },

  //check if a scenario name already exists
  check_scenario_name_exists: async (name: string) => {
    try {
      //get all scenarios for the user
      const response = await axios_instance.get(SCENARIO_ENDPOINT);
      if (!response.data.success) {
        return false;
      }
      
      //check if any scenario has the same name
      const scenarios = response.data.data || [];
      return scenarios.some((scenario: any) => 
        scenario.name.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      console.error('Error checking scenario name:', error);
      //default to false on error aka allows user to continue
      return false;
    }
  },
};

export default scenario_service;
