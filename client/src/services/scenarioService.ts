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

  // Diagnostic method to check if the shared scenarios endpoints are properly implemented
  check_shared_scenarios_endpoints: async () => {
    try {
      console.log('Checking shared scenarios endpoint implementation...');
      
      // Check if the endpoints are accessible
      const checkEndpoints = [];
      
      // Try checking the shared-with-me endpoint
      try {
        const response1 = await axios_instance.options(`${SCENARIO_ENDPOINT}/shared-with-me`);
        checkEndpoints.push({ endpoint: 'shared-with-me', status: 'accessible', details: response1.status });
      } catch (error: any) {
        checkEndpoints.push({ 
          endpoint: 'shared-with-me', 
          status: 'error', 
          details: error.response ? error.response.status : 'network-error' 
        });
      }
      
      // Try checking the shared-by-me endpoint
      try {
        const response2 = await axios_instance.options(`${SCENARIO_ENDPOINT}/shared-by-me`);
        checkEndpoints.push({ endpoint: 'shared-by-me', status: 'accessible', details: response2.status });
      } catch (error: any) {
        checkEndpoints.push({ 
          endpoint: 'shared-by-me', 
          status: 'error', 
          details: error.response ? error.response.status : 'network-error' 
        });
      }
      
      return {
        success: true,
        endpoints: checkEndpoints
      };
    } catch (error) {
      console.error('Error checking shared scenario endpoints:', error);
      throw error;
    }
  },

  // Sharing functionality with improved error handling
  get_shared_with_me_scenarios: async () => {
    try {
      console.log('Calling get_shared_with_me_scenarios API endpoint');
      const response = await axios_instance.get(`${SCENARIO_ENDPOINT}/shared-with-me`);
      console.log('get_shared_with_me_scenarios response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching shared scenarios:', error);
      // Add more detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  share_scenario: async (scenarioId: string, shareWithEmail: string, permission: 'read' | 'write' = 'read') => {
    try {
      const response = await axios_instance.post(`${SCENARIO_ENDPOINT}/share`, {
        scenarioId,
        shareWithEmail,
        permission
      });
      return response.data;
    } catch (error) {
      console.error('Error sharing scenario:', error);
      throw error;
    }
  },

  revoke_access: async (scenarioId: string, userId: string) => {
    try {
      const response = await axios_instance.post(`${SCENARIO_ENDPOINT}/revoke-access`, {
        scenarioId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error revoking access:', error);
      throw error;
    }
  },

  get_shared_by_me_scenarios: async () => {
    try {
      console.log('Calling get_shared_by_me_scenarios API endpoint');
      const response = await axios_instance.get(`${SCENARIO_ENDPOINT}/shared-by-me`);
      console.log('get_shared_by_me_scenarios response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching scenarios shared by you:', error);
      throw error;
    }
  }
};

export default scenario_service;
