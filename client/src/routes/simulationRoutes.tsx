import React from 'react';
import { Route } from 'react-router-dom';

import { ProtectedRoute } from '../common';
import { Layout } from '../layouts';
import SimulationResults from '../pages/SimulationResultsPage';

// Placeholder components
const RunSimulation = () => <div>Run Simulation Placeholder</div>;

//const SimulationResults = () => <div>Simulation Results</div>;

const OneDimensionExploration = () => <div>One Dimension Exploration</div>;

const TwoDimensionExploration = () => <div>Two Dimension Exploration</div>;

const SimulationRoutes = [
  // Simulation Routes
  <Route
    key="simulation-run"
    path="/simulation/run"
    element={
      <ProtectedRoute>
        <Layout title="Run Simulation">
          <RunSimulation />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="simulation-results"
    path="/simulation/results"
    element={
      <ProtectedRoute>
        <Layout title="Simulation Results">
          <SimulationResults />
        </Layout>
      </ProtectedRoute>
    }
  />,

  // Exploration Routes
  <Route
    key="exploration-one-dimension"
    path="/exploration/one-dimension"
    element={
      <ProtectedRoute>
        <Layout title="1D Exploration">
          <OneDimensionExploration />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="exploration-two-dimension"
    path="/exploration/two-dimension"
    element={
      <ProtectedRoute>
        <Layout title="2D Exploration">
          <TwoDimensionExploration />
        </Layout>
      </ProtectedRoute>
    }
  />,
];

export default SimulationRoutes;
