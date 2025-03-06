import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InvestmentDashboard from "./pages/Dashboard/InvestmentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Test from "./pages/Test";

// Custom theme
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
    global: {
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
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/investment"
            element={
              <ProtectedRoute>
                <InvestmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <Test/>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
