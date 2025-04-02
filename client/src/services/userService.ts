import axios from 'axios';
import { API_URL } from "./api";

// Set up axios with auth token
const authAxios = axios.create({
  baseURL: API_URL
});

// Add auth token to requests
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User API functions
export const userService = {
  // Register new user
  register: async (name: string, email: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/users/register`, {
      name,
      email,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  },
  
  // Login user
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/users/login`, {
      email,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  // Get user profile
  getProfile: async () => {
    try {
      // Get token from localStorage or cookies
      const token = localStorage.getItem('token');
      
      // If using session-based auth with cookies, just use withCredentials
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  // Update user profile
  updateProfile: async (userData: any) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, userData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}; 