import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Authentication logic
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  // Temporary set to true for development testing
  const isAuthenticatedForDev = true;

  if (!isAuthenticatedForDev && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 