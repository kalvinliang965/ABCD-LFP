import React from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

// Placeholder components
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
  <Layout title="Basic Info">
    <div>Basic Info</div>
  </Layout>
);

const EventSeries = () => (
  <Layout title="Event Series">
    <div>Event Series</div>
  </Layout>
);

const Strategies = () => (
  <Layout title="Strategies">
    <div>Strategies</div>
  </Layout>
);

const ScenarioRoutes = [
  // Scenarios Routes
  <Route
    key="scenarios-list"
    path="/scenarios"
    element={
      <ProtectedRoute>
        <ScenariosList />
      </ProtectedRoute>
    }
  />,
  <Route
    key="scenarios-import-export"
    path="/scenarios/import-export"
    element={
      <ProtectedRoute>
        <ScenariosImportExport />
      </ProtectedRoute>
    }
  />,
  <Route
    key="scenarios-shared"
    path="/scenarios/shared"
    element={
      <ProtectedRoute>
        <ScenariosShared />
      </ProtectedRoute>
    }
  />,

  // Scenario Builder Routes
  <Route
    key="builder-basic-info"
    path="/builder/basic-info"
    element={
      <ProtectedRoute>
        <BasicInfo />
      </ProtectedRoute>
    }
  />,
  <Route
    key="builder-investments"
    path="/builder/investments"
    element={<Navigate to="/dashboard/investment" replace />}
  />,
  <Route
    key="builder-events"
    path="/builder/events"
    element={
      <ProtectedRoute>
        <EventSeries />
      </ProtectedRoute>
    }
  />,
  <Route
    key="builder-strategies"
    path="/builder/strategies"
    element={
      <ProtectedRoute>
        <Strategies />
      </ProtectedRoute>
    }
  />,
];

export default ScenarioRoutes;
