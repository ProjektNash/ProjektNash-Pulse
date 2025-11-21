import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  LayoutDashboard,
  Shield,
  Package,
  Building2,
  Wrench,
  CalendarDays,
  FlaskRound,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const BASE = import.meta.env.BASE_URL;

  const user = JSON.parse(localStorage.getItem("pnUser")) || {
    allowedModules: [],
    role: "user",
  };

  const [collapsed, setCollapsed] = useState(false);

  const can = (module) => user.allowedModules?.includes(module);

  const menuItems = [
    can("dashboard") && {
      name: "Dashboard",
      path: `${BASE}`,
      icon: <LayoutDashboard size={20} />,
    },
    can("safety") && {
      name: "Safety",
      path: `${BASE}safety`,
      icon: <Shield size={20} />,
    },
    can("assets") && {
      name: "Assets",
      path: `${BASE}assets`,
      icon: <Package size={20} />,
    },
    can("businessPartners") && {
      name: "Business Partners",
      path: `${BASE}business-partners`,
      icon: <Building2 size={20} />,
    },
    can("maintenance") && {
      name: "Maintenance",
      path: `${BASE}maintenance`,
      icon: <Wrench size={20} />,
    },
    can("preventiveMaintenance") && {
      name: "Preventive Maintenance",
      path: `${BASE}preventive-maintenance`,
      icon: <Wrench size={20} />,
    },
    can("maintenanceCalendar") && {
      name: "Maintenance Calendar",
      path: `${BASE}maintenance-calendar`,
      icon: <CalendarDays size={20} />,
    },
    can("digitalLabBook") && {
      name: "Digital Lab Book",
      path: `${BASE}digital-lab-book`,
      icon: <FlaskRound size={20} />,
    },
  ].filter(Boolean);

  return (
    <div
      className="sidebar d-flex flex-column bg-dark text-white p-2"
      style={{
        width: collapsed ? "70px" : "240px",
        minHeight: "100vh",
        transition: "width 0.25s",
        overflow: "hidden",
      }}
    >
      {/* HEADER ROW (Title + Collapse Button) */}
      <div className="d-flex align-items-center justify-content-between mb-3 px-2">
        {!collapsed && (
          <h6 className="fw-bold text-info m-0">
            Pulse Roll Label Products
          </h6>
        )}

        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => setCollapsed(!collapsed)}
          style={{ minWidth: "32px" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item) => (
          <li className="nav-item mb-2" key={item.path}>
            <Link
              to={item.path}
              className={`nav-link text-white d-flex align-items-center gap-2 ${
                location.pathname === item.path ? "active bg-info" : ""
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </Link>
          </li>
        ))}

        {/* SETTINGS SECTION */}
        <li className="nav-item mt-3">
          <a
            className="nav-link text-white dropdown-toggle d-flex align-items-center gap-2"
            data-bs-toggle="collapse"
            href="#settingsMenu"
          >
            <Settings size={20} />
            {!collapsed && <span>Settings</span>}
          </a>

          <ul className="collapse list-unstyled ps-3" id="settingsMenu">
            <li className="nav-item mb-1">
              <Link
                to={`${BASE}settings/change-password`}
                className={`nav-link text-white ${
                  location.pathname.startsWith(`${BASE}settings/change-password`)
                    ? "active bg-info"
                    : ""
                }`}
              >
                {!collapsed && "Change Password"}
              </Link>
            </li>

            {user.role === "admin" && (
              <>
                <li className="nav-item mb-1">
                  <Link
                    to={`${BASE}settings/finance`}
                    className={`nav-link text-white ${
                      location.pathname.startsWith(`${BASE}settings/finance`)
                        ? "active bg-info"
                        : ""
                    }`}
                  >
                    {!collapsed && "Finance"}
                  </Link>
                </li>

                <li className="nav-item mb-1">
                  <Link
                    to={`${BASE}settings/users`}
                    className={`nav-link text-white ${
                      location.pathname.startsWith(`${BASE}settings/users`)
                        ? "active bg-info"
                        : ""
                    }`}
                  >
                    {!collapsed && "User Management"}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </li>
      </ul>

      {!collapsed && (
        <div className="text-center small text-secondary mt-auto">
          © ProjektNash
        </div>
      )}
    </div>
  );
}
