import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ChakraProvider, extendTheme, ColorModeScript } from "@chakra-ui/react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InvestmentDashboard from "./pages/Dashboard/InvestmentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./components/Layout";

// Placeholder components for new routes - these will need to be implemented
const ScenariosList = () => (
  <Layout title="My Scenarios">
    <div>My Scenarios</div>
  </Layout>
);

const ScenariosImportExport = () => (
  <Layout title="Import/Export Scenarios">
    <div>Import/Export Scenarios</div>
  </Layout>
);

const ScenariosShared = () => (
  <Layout title="Shared Scenarios">
    <div>Shared Scenarios</div>
  </Layout>
);

const BasicInfo = () => (
  <Layout title="Basic Information">
    <div>Scenario Basic Info</div>
  </Layout>
);

const Investments = () => (
  <Layout title="Investments Configuration">
    <div>Investments Configuration</div>
  </Layout>
);

const EventSeries = () => (
  <Layout title="Event Series Configuration">
    <div>Event Series Configuration</div>
  </Layout>
);

const Strategies = () => (
  <Layout title="Strategies Configuration">
    <div>Strategies Configuration</div>
  </Layout>
);

const RunSimulation = () => (
  <Layout title="Run Simulation">
    <div>Run Simulation</div>
  </Layout>
);

const SimulationResults = () => (
  <Layout title="Simulation Results">
    <div>Simulation Results & Charts</div>
  </Layout>
);

const OneDimensionExploration = () => (
  <Layout title="One-Dimensional Exploration">
    <div>One-Dimensional Scenario Exploration</div>
  </Layout>
);

const TwoDimensionExploration = () => (
  <Layout title="Two-Dimensional Exploration">
    <div>Two-Dimensional Scenario Exploration</div>
  </Layout>
);

const Settings = () => (
  <Layout title="User Settings">
    <div>User Settings</div>
  </Layout>
);

const Logout = () => {
  // Implement logout logic
  return <Navigate to="/login" />;
};

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
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout title="Dashboard">
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Existing Investment Dashboard Route */}
          <Route
            path="/dashboard/investment"
            element={
              <ProtectedRoute>
                <Layout title="Investment Dashboard">
                  <InvestmentDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Scenarios Routes */}
          <Route
            path="/scenarios"
            element={
              <ProtectedRoute>
                <ScenariosList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios/import-export"
            element={
              <ProtectedRoute>
                <ScenariosImportExport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios/shared"
            element={
              <ProtectedRoute>
                <ScenariosShared />
              </ProtectedRoute>
            }
          />

          {/* Scenario Builder Routes */}
          <Route
            path="/builder/basic-info"
            element={
              <ProtectedRoute>
                <BasicInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder/investments"
            element={<Navigate to="/dashboard/investment" replace />}
          />
          <Route
            path="/builder/events"
            element={
              <ProtectedRoute>
                <EventSeries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder/strategies"
            element={
              <ProtectedRoute>
                <Strategies />
              </ProtectedRoute>
            }
          />

          {/* Simulation Routes */}
          <Route
            path="/simulation/run"
            element={
              <ProtectedRoute>
                <RunSimulation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulation/results"
            element={
              <ProtectedRoute>
                <SimulationResults />
              </ProtectedRoute>
            }
          />

          {/* Exploration Routes */}
          <Route
            path="/exploration/one-dimension"
            element={
              <ProtectedRoute>
                <OneDimensionExploration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exploration/two-dimension"
            element={
              <ProtectedRoute>
                <TwoDimensionExploration />
              </ProtectedRoute>
            }
          />

          {/* Account Routes */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
