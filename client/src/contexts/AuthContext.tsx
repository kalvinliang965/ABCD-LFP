import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  googleId: string;
  scenarios: Array<{
    _id: string;
    name: string;
    description?: string;
    createdAt: Date;
    sharedWith: Array<any>;
  }>;
  yamlFiles: Array<{
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
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/current-user`, {
        withCredentials: true,
      });
      setUser(response.data);
      setError(null);
    } catch (err) {
      setUser(null);
      setError('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const logout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        withCredentials: true,
      });
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      checkAuthStatus, 
      logout, 
      loginWithGoogle,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 