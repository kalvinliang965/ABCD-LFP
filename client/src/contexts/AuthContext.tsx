import axios from 'axios';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  userId?: string;
  name: string;
  email: string;
  googleId?: string;
  isGuest?: boolean;
  scenarios?: Array<{
    _id: string;
    name: string;
    description?: string;
    createdAt: Date;
    sharedWith: Array<any>;
  }>;
  yamlFiles?: Array<{
    _id: string;
    name: string;
    content: string;
    createdAt: Date;
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isGuestUser: boolean;
  setAuthToken: (token: string) => void;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  loginAsGuest: (guestData: User) => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestUser, setIsGuestUser] = useState(false);

  const checkAuthStatus = async () => {
    try {
      // First check if we have a guest user stored
      const guestUserStr = localStorage.getItem('guestUser');
      if (guestUserStr) {
        const guestUser = JSON.parse(guestUserStr);
        setUser(guestUser);
        setIsAuthenticated(true);
        setIsGuestUser(true);
        setError(null);
        setLoading(false);
        return;
      }

      // Otherwise check for regular authentication
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/current-user`, {
        withCredentials: true,
      });
      setUser(response.data);
      setIsAuthenticated(true);
      setIsGuestUser(false);
      setError(null);
    } catch (err) {
      setUser(null);
      setError('Not authenticated');
      setIsAuthenticated(false);
      setIsGuestUser(false);
    } finally {
      setLoading(false);
    }
  };

  const setAuthToken = (token: string) => {
    localStorage.setItem('token', token);
  };

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const loginAsGuest = (guestData: User) => {
    setUser(guestData);
    setIsAuthenticated(true);
    setIsGuestUser(true);
    setError(null);
    // No need to set loading here since we're not making any API calls
  };

  const logout = async () => {
    try {
      // Check if it's a guest user
      if (isGuestUser) {
        localStorage.removeItem('guestUser');
        setUser(null);
        setIsAuthenticated(false);
        setIsGuestUser(false);
        return;
      }

      // Regular logout for authenticated users
      await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        withCredentials: true,
      });
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setIsGuestUser(false);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      
      // If it's a guest user, update localStorage as well
      if (prev.isGuest) {
        const updatedUser = { ...prev, ...userData };
        localStorage.setItem('guestUser', JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      return { ...prev, ...userData };
    });
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isGuestUser,
    setAuthToken,
    checkAuthStatus,
    logout,
    loginWithGoogle,
    loginAsGuest,
    updateUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
