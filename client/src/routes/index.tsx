import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import UserProfile from '../components/user/UserProfile';
import Login from '../pages/Login';
import SimulationResultsPage from '../pages/SimulationResultsPage';

import AccountRoutes from './accountRoutes';
import DashboardRoutes from './dashboardRoutes';
import ScenarioRoutes from './scenarioRoutes';
import SimulationRoutes from './simulationRoutes';
//import "./config/passport";

// Pages

const AppRoutes = () => {
  return (
    <Routes>
      {/* Basic routes - login page usually does not need a standard layout */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard routes - for main dashboard and related pages */}
      {DashboardRoutes}

      {/* Scenario routes - for managing financial scenarios */}
      {ScenarioRoutes}

      {/* Simulation routes - for running financial simulations */}
      {SimulationRoutes}

      {/* Account routes - for account settings and logout */}
      {AccountRoutes}

      {/* User profile route - for viewing and editing user profile */}
      <Route path="/profile" element={<UserProfile />} />

      {/* Simulation results route - for viewing simulation results */}
      <Route path="/scenarios/:scenarioId/results" element={<SimulationResultsPage />} />
    </Routes>
  );
};

export default AppRoutes;
