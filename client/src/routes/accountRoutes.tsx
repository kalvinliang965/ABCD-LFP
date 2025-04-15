import React from 'react';
import { Route, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '../common';
import { Layout } from '../layouts';

// account related components
const Settings = () => (
  <Layout title="Settings">
    <div>Settings</div>
  </Layout>
);

const Logout = () => {
  // Logic for logout - for example, clear the token in local storage
  localStorage.removeItem('token');
  return <Navigate to="/login" replace />;
};

const AccountRoutes = [
  <Route
    key="settings"
    path="/settings"
    element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    }
  />,
  <Route key="logout" path="/logout" element={<Logout />} />,
];

export default AccountRoutes;
