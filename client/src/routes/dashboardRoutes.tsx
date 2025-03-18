import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import InvestmentDashboard from "../pages/Dashboard/InvestmentDashboard";

const DashboardRoutes = [
  <Route
    key="dashboard-main"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Layout title="Dashboard">
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="dashboard-investment"
    path="/dashboard/investment"
    element={
      <ProtectedRoute>
        <Layout title="Investment Dashboard">
          <InvestmentDashboard />
        </Layout>
      </ProtectedRoute>
    }
  />,
];

export default DashboardRoutes;
