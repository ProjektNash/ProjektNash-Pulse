import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ module, children }) {
  const location = useLocation();
  const BASE = import.meta.env.BASE_URL;

  const user = JSON.parse(localStorage.getItem("pnUser") || "null");

  // If not logged in → redirect correctly using BASE path
  if (!user) {
    return (
      <Navigate
        to={`${BASE}login`}
        replace
        state={{ from: location }}
      />
    );
  }

  // Admin bypasses module restrictions
  if (user.role === "admin") {
    return children;
  }

  // Check module permission
  if (module && !user.allowedModules?.includes(module)) {
    return (
      <div className="p-4">
        <h4>Access Denied</h4>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

  return children;
}
