import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../common";
import { Layout } from "../layouts";
import Dashboard from "../pages/Dashboard";
/**
 * AI prompt : make our sidebar functional, and make the dashboard page and the investment dashboard page functional
 */
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
  />
];

export default DashboardRoutes;
