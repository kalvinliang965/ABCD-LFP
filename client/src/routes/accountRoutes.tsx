import React from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../common";
import { Layout } from "../layouts";

// 账户相关组件
const Settings = () => (
  <Layout title="Settings">
    <div>Settings</div>
  </Layout>
);

const Logout = () => {
  // Logic for logout - 例如清除本地存储的token
  localStorage.removeItem("token");
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
