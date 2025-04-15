import { Route, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '../common';
import { Layout } from '../layouts';
import MyScenariosPage from '../pages/scenarios/MyScenariosPage';
import NewScenarioPage from '../pages/scenarios/NewScenarioPage';

// Scenarios List Component
// ! this function is not used anymore

const ScenariosImportExport = () => <div>Import/Export Scenarios</div>;

const ScenariosShared = () => <div>Shared Scenarios</div>;

const BasicInfo = () => <div>Basic Info</div>;

const EventSeries = () => <div>Event Series</div>;

const Strategies = () => <div>Strategies</div>;

/**
 * AI prompt : help me design a scenario route to show the scenario list page, new scenario page, import/export scenario page, shared scenario page, basic info page, event series page, strategies page
 */
const ScenarioRoutes = [
  // Scenarios Routes
  <Route
    key="scenarios-list"
    path="/scenarios"
    element={
      <ProtectedRoute>
        <Layout title="My Scenarios">
          <MyScenariosPage />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="scenarios-new"
    path="/scenarios/new"
    element={
      <ProtectedRoute>
        <Layout title="New Scenario">
          <NewScenarioPage />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    //added for edit draft scenario
    key="scenarios-edit"
    path="/scenarios/edit/:id"
    element={
      <ProtectedRoute>
        <Layout title="Edit Scenario">
          <NewScenarioPage />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="scenarios-import-export"
    path="/scenarios/import-export"
    element={
      <ProtectedRoute>
        <Layout title="Import/Export Scenarios">
          <ScenariosImportExport />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="scenarios-shared"
    path="/scenarios/shared"
    element={
      <ProtectedRoute>
        <Layout title="Shared Scenarios">
          <ScenariosShared />
        </Layout>
      </ProtectedRoute>
    }
  />,

  // Scenario Builder Routes
  <Route
    key="builder-basic-info"
    path="/builder/basic-info"
    element={
      <ProtectedRoute>
        <Layout title="Basic Info">
          <BasicInfo />
        </Layout>
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
        <Layout title="Event Series">
          <EventSeries />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="builder-strategies"
    path="/builder/strategies"
    element={
      <ProtectedRoute>
        <Layout title="Strategies">
          <Strategies />
        </Layout>
      </ProtectedRoute>
    }
  />,
];

export default ScenarioRoutes;
