import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { ChakraProvider, extendTheme, ColorModeScript, Text } from "@chakra-ui/react";
import { EventSeriesProvider } from "./contexts/EventSeriesContext";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/Login';
import { Flex, Spinner } from '@chakra-ui/react';
import AppRoutes from "./routes";
import axios from 'axios';
import { API_URL } from './services/api';

// Custom theme with color mode config
const theme = extendTheme({
  fonts: {
    heading: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    body: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
  },
  colors: {
    brand: {
      50: "#e6f7ff",
      100: "#bae7ff",
      500: "#1890ff",
      600: "#096dd9",
      700: "#0050b3",
    },
  },
  styles: {
    global: (props: { colorMode: "light" | "dark" }) => ({
      // Preserve original CSS for login page
      ".main": {
        fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
      },
      ".is-hidden": {
        opacity: 0,
        visibility: "hidden",
        transition: "0.25s",
        position: "absolute",
      },
      ".is-gx": {
        animation: "is-gx 1.25s",
      },
      "@keyframes is-gx": {
        "0%, 10%, 100%": {
          width: "400px",
        },
        "30%, 50%": {
          width: "500px",
        },
      },
      // Body background color based on color mode
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "white",
        color: props.colorMode === "dark" ? "white" : "gray.800",
      },
    }),
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: true,
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      // Set default auth header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <AuthProvider>
        <Router>
          <EventSeriesProvider>
            <Routes>
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<AppRoutes />} />
            </Routes>
          </EventSeriesProvider>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export function AuthCallback() {
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        await checkAuthStatus();
        // Add console log to debug
        console.log("Auth status checked, redirecting to dashboard");
        navigate('/dashboard');
      } catch (error) {
        console.error("Error during auth callback:", error);
        navigate('/login');
      }
    };
    
    handleCallback();
  }, [checkAuthStatus, navigate]);
  
  return (
    <Flex justify="center" align="center" height="100vh">
      <Spinner size="xl" />
      <Text ml={4}>Authenticating...</Text>
    </Flex>
  );
}

export default App;
