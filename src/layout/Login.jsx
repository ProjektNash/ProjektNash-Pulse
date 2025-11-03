import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  // --- Hardcoded users (add more as needed) ---
  const users = {
    admin: "admin123",
    nash: "projektnash",
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const username = form.username.trim().toLowerCase();
    const password = form.password.trim();

    // ✅ Validate login
    if (users[username] && users[username] === password) {
      localStorage.setItem("pn_loggedIn", "true");
      localStorage.setItem("pn_user", username);

      setError("");
      navigate("/", { replace: true }); // redirect to dashboard
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="card shadow-sm p-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h4 className="text-center mb-3 text-info fw-bold">
          ProjektNash-Core
        </h4>
        <p className="text-center text-secondary mb-4">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 small text-center">
              {error}
            </div>
          )}

          <div className="d-grid">
            <button className="btn btn-info text-white fw-semibold" type="submit">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
