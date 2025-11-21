import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Login from "./Login";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Modules
import Assets from "../modules/Assets/Assets";
import Maintenance from "../modules/Maintenance/Maintenance";
import PreventiveMaintenance from "../modules/Preventive-Maintenance/PreventiveMaintenance";
import MaintenanceCalendar from "../modules/Maintenance-Calendar/MaintenanceCalendar";
import BusinessPartners from "../modules/BusinessPartners/BusinessPartners";
import FinanceSettings from "../modules/Settings/FinanceSettings.jsx";

// Digital Lab Book
import DigitalLabBook from "../modules/DigitalLabBook/pages/DigitalLabBook.jsx";
import CreateFormula from "../modules/DigitalLabBook/pages/CreateFormula.jsx";
import FormulaBuilder from "../modules/DigitalLabBook/pages/FormulaBuilder.jsx";

// User Management
import UserManagement from "../modules/Settings/UserManagement.jsx";

// Password screens
import ChangePasswordFirstTime from "../modules/Settings/ChangePasswordFirstTime.jsx";
import ChangePassword from "../modules/Settings/ChangePassword.jsx";

function Dashboard() {
  return (
    <div className="p-4">
      <h3>Dashboard</h3>
    </div>
  );
}

function Safety() {
  return (
    <div className="p-4">
      <h3>Safety</h3>
    </div>
  );
}

export default function AppRouter() {
  const BASE = import.meta.env.BASE_URL;

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("pnUser") || "null")
  );

  // Keep user state live
  useEffect(() => {
    const interval = setInterval(() => {
      setUser(JSON.parse(localStorage.getItem("pnUser") || "null"));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Routes>

        {/* ⭐ FIRST-TIME PASSWORD FORCE PAGE */}
        <Route
          path={`${BASE}change-password`}
          element={<ChangePasswordFirstTime />}
        />

        {/* ⭐ LOGIN */}
        <Route
          path={`${BASE}login`}
          element={!user ? <Login /> : <Navigate to={`${BASE}`} />}
        />

        {/* ⭐ LOGGED-IN AREA */}
        {user && (
          <Route
            path="*"
            element={
              <div className="d-flex">
                <Sidebar />
                <div className="flex-grow-1 bg-light min-vh-100">
                  <Navbar />

                  <div className="container-fluid mt-3">
                    <Routes>

                      {/* Dashboard */}
                      <Route
                        path={`${BASE}`}
                        element={
                          <ProtectedRoute module="dashboard">
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />

                      {/* Safety */}
                      <Route
                        path={`${BASE}safety`}
                        element={
                          <ProtectedRoute module="safety">
                            <Safety />
                          </ProtectedRoute>
                        }
                      />

                      {/* Assets */}
                      <Route
                        path={`${BASE}assets`}
                        element={
                          <ProtectedRoute module="assets">
                            <Assets />
                          </ProtectedRoute>
                        }
                      />

                      {/* Business Partners */}
                      <Route
                        path={`${BASE}business-partners`}
                        element={
                          <ProtectedRoute module="businessPartners">
                            <BusinessPartners />
                          </ProtectedRoute>
                        }
                      />

                      {/* Maintenance */}
                      <Route
                        path={`${BASE}maintenance`}
                        element={
                          <ProtectedRoute module="maintenance">
                            <Maintenance />
                          </ProtectedRoute>
                        }
                      />

                      {/* Preventive Maintenance */}
                      <Route
                        path={`${BASE}preventive-maintenance`}
                        element={
                          <ProtectedRoute module="preventiveMaintenance">
                            <PreventiveMaintenance />
                          </ProtectedRoute>
                        }
                      />

                      {/* Maintenance Calendar */}
                      <Route
                        path={`${BASE}maintenance-calendar`}
                        element={
                          <ProtectedRoute module="maintenanceCalendar">
                            <MaintenanceCalendar />
                          </ProtectedRoute>
                        }
                      />

                      {/* Digital Lab Book */}
                      <Route
                        path={`${BASE}digital-lab-book`}
                        element={
                          <ProtectedRoute module="digitalLabBook">
                            <DigitalLabBook />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path={`${BASE}digital-lab-book/create`}
                        element={
                          <ProtectedRoute module="digitalLabBook">
                            <CreateFormula />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path={`${BASE}digital-lab-book/builder/:id`}
                        element={
                          <ProtectedRoute module="digitalLabBook">
                            <FormulaBuilder />
                          </ProtectedRoute>
                        }
                      />

                      {/* Finance Settings */}
                      <Route
                        path={`${BASE}settings/finance`}
                        element={
                          <ProtectedRoute>
                            <FinanceSettings />
                          </ProtectedRoute>
                        }
                      />

                      {/* User Management */}
                      <Route
                        path={`${BASE}settings/users`}
                        element={
                          <ProtectedRoute>
                            <UserManagement />
                          </ProtectedRoute>
                        }
                      />

                      {/* Change password (normal) */}
                      <Route
                        path={`${BASE}settings/change-password`}
                        element={
                          <ProtectedRoute>
                            <ChangePassword />
                          </ProtectedRoute>
                        }
                      />

                      {/* Fallback inside app */}
                      <Route
                        path="*"
                        element={<Navigate to={`${BASE}`} replace />}
                      />

                    </Routes>
                  </div>
                </div>
              </div>
            }
          />
        )}

        {/* Global fallback */}
        <Route path="*" element={<Navigate to={`${BASE}login`} replace />} />

      </Routes>
    </Router>
  );
}
