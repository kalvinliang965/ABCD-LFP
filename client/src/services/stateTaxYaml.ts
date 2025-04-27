import axios from 'axios';

import { StateTaxBracket } from '../types/StateTaxBracket';

import { API_URL } from './api';

const STATE_TAX_YAML_ENDPOINT = `${API_URL}/state_tax_yaml`;

const axios_instance = axios.create({
    headers: {
      'Content-Type': 'application/x-yaml',
    },
    withCredentials: true,
  });

export const stateTaxYAMLService = {
    create: async (yaml: string): Promise<StateTaxBracket> => {
      try {
        console.log('you are in STATE TAX YAML scenario api');
        // Using the authenticated axios instance to send the YAML content
        const response = await axios_instance.post(STATE_TAX_YAML_ENDPOINT, yaml);
  
        return response.data;
      } catch (error) {
        console.error('Error creating YAML scenario:', error);
        throw error;
      }
    },
  };
  
  export default stateTaxYAMLService;
  