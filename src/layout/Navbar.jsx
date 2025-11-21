import React, { useEffect, useState } from "react";

export default function Navbar() {
  const [username, setUsername] = useState("");

  // Load display name or username from pnUser
  useEffect(() => {
    const stored = localStorage.getItem("pnUser");

    if (stored) {
      const user = JSON.parse(stored);

      if (user.displayName) {
        setUsername(user.displayName);
      } else if (user.username) {
        const formatted =
          user.username.charAt(0).toUpperCase() + user.username.slice(1);
        setUsername(formatted);
      }
    }
  }, []);

  const handleLogout = () => {
    // Remove NEW auth system keys
    localStorage.removeItem("pnUser");
    localStorage.removeItem("pnToken");

    // Remove old system keys (cleanup)
    localStorage.removeItem("pn_loggedIn");
    localStorage.removeItem("pn_user");

    // Guaranteed redirect
    window.location.href = "/login";
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm px-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Left side - welcome message */}
        <span className="text-secondary small">
          Welcome, <strong>{username || "User"}</strong>
        </span>

        {/* Right side - logout button */}
        <button
          onClick={handleLogout}
          className="btn btn-outline-secondary btn-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
