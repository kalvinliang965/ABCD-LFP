import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardRoutes from "./dashboardRoutes";
import ScenarioRoutes from "./scenarioRoutes";
import SimulationRoutes from "./simulationRoutes";
import AccountRoutes from "./accountRoutes";
import UserProfile from "../components/user/UserProfile";

// Pages
import Login from "../pages/Login";

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
    </Routes>
  );
};

export default AppRoutes;
