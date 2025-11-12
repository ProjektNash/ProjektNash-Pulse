import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Login from "./Login";
import Assets from "../modules/Assets/Assets";
import MaintenanceCalendar from "../modules/Maintenance-Calendar/MaintenanceCalendar";

// --- Temporary placeholder pages ---
function Dashboard() {
  return (
    <div className="p-4">
      <h3 className="mb-3">Dashboard</h3>
      <p className="text-secondary">Welcome to ProjektNash-Core.</p>
    </div>
  );
}

function Maintenance() {
  return (
    <div className="p-4">
      <h3 className="mb-3">Maintenance Calendar</h3>
      <MaintenanceCalendar />
    </div>
  );
}

function Safety() {
  return (
    <div className="p-4">
      <h3 className="mb-3">Safety</h3>
      <p className="text-secondary">Placeholder module page.</p>
    </div>
  );
}

// --- Main Router ---
export default function AppRouter() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("pn_loggedIn") === "true"
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setLoggedIn(localStorage.getItem("pn_loggedIn") === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const checkLogin = setInterval(() => {
      const stored = localStorage.getItem("pn_loggedIn") === "true";
      if (stored !== loggedIn) setLoggedIn(stored);
    }, 500);
    return () => clearInterval(checkLogin);
  }, [loggedIn]);

  return (
    <Router>
      {!loggedIn ? (
        // --- Login screen ---
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        // --- Main layout ---
        <div className="d-flex">
          <Sidebar />
          <div className="flex-grow-1 bg-light min-vh-100">
            <Navbar />
            <div className="container-fluid mt-3">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/safety" element={<Safety />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/maintenance-calendar" element={<Maintenance />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}
