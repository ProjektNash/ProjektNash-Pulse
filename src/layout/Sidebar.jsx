import React from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Sidebar() {
  const location = useLocation();

  // ✅ Control which modules are visible
  const showDashboard = true;
  const showSafety = false;
  const showAssets = true;
  const showBusinessPartners = true; // 👈 New module toggle

  const showMaintenance = true; // 👈 External / Engineer jobs
  const showPreventiveMaintenance = false; // 👈 In-House / Preventive tasks
  const showMaintenanceCalendar = true; // 👈 Calendar dashboard

  const menuItems = [
    showDashboard && { name: "Dashboard", path: "/" },
    showSafety && { name: "Safety", path: "/safety" },
    showAssets && { name: "Assets", path: "/assets" },
    showBusinessPartners && {
      name: "Business Partners",
      path: "/business-partners",
    },
    showMaintenance && { name: "Maintenance", path: "/maintenance" },
    showPreventiveMaintenance && {
      name: "Preventive-Maintenance",
      path: "/preventive-maintenance",
    },
    showMaintenanceCalendar && {
      name: "Maintenance-Calendar",
      path: "/maintenance-calendar",
    },
  ].filter(Boolean); // removes false items

  return (
    <div
      className="d-flex flex-column bg-dark text-white p-3"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <h4 className="mb-4 text-center fw-bold text-info">ProjektNash-Core</h4>

      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item) => (
          <li className="nav-item mb-2" key={item.path}>
            <Link
              to={item.path}
              className={`nav-link text-white ${
                location.pathname === item.path ? "active bg-info" : ""
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="text-center small text-secondary mt-auto">
        © ProjektNash
      </div>
    </div>
  );
}
