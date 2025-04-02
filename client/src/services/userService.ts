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
    const response = await authAxios.get('/api/users/profile');
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (userData: { name?: string; email?: string; profilePicture?: string }) => {
    const response = await authAxios.put('/api/users/profile', userData);
    return response.data;
  }
}; 