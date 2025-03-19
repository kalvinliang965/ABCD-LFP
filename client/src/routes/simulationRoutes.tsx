import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../common";
import { Layout } from "../layouts";

// Placeholder components
const RunSimulation = () => (
  <Layout title="Run Simulation">
    <div>Run Simulation</div>
  </Layout>
);

const SimulationResults = () => (
  <Layout title="Simulation Results">
    <div>Simulation Results</div>
  </Layout>
);

const OneDimensionExploration = () => (
  <Layout title="1D Exploration">
    <div>One Dimension Exploration</div>
  </Layout>
);

const TwoDimensionExploration = () => (
  <Layout title="2D Exploration">
    <div>Two Dimension Exploration</div>
  </Layout>
);

const SimulationRoutes = [
  // Simulation Routes
  <Route
    key="simulation-run"
    path="/simulation/run"
    element={
      <ProtectedRoute>
        <RunSimulation />
      </ProtectedRoute>
    }
  />,
  <Route
    key="simulation-results"
    path="/simulation/results"
    element={
      <ProtectedRoute>
        <SimulationResults />
      </ProtectedRoute>
    }
  />,

  // Exploration Routes
  <Route
    key="exploration-one-dimension"
    path="/exploration/one-dimension"
    element={
      <ProtectedRoute>
        <OneDimensionExploration />
      </ProtectedRoute>
    }
  />,
  <Route
    key="exploration-two-dimension"
    path="/exploration/two-dimension"
    element={
      <ProtectedRoute>
        <TwoDimensionExploration />
      </ProtectedRoute>
    }
  />,
];

export default SimulationRoutes;
