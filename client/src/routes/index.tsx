import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardRoutes from "./dashboardRoutes";
import ScenarioRoutes from "./scenarioRoutes";
import SimulationRoutes from "./simulationRoutes";
import AccountRoutes from "./accountRoutes";

// Pages
import Login from "../pages/Login";

const AppRoutes = () => {
  return (
    <Routes>
      {/* basic routes - login page usually does not need a standard layout */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* dashboard routes */}
      {DashboardRoutes}

      {/* scenario routes */}
      {ScenarioRoutes}

      {/* simulation routes */}
      {SimulationRoutes}

      {/* account routes */}
      {AccountRoutes}
    </Routes>
  );
};

export default AppRoutes;
