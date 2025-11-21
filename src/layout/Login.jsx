import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE;
  const BASE = import.meta.env.BASE_URL;

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // ⭐ MUST RUN FIRST even if 403
      if (data.mustChangePassword) {
        localStorage.setItem("pnForcePasswordChangeUserId", data.userId);
        navigate(`${BASE}change-password`, { replace: true });
        return;
      }

      // ❌ Normal error (wrong password, inactive user, etc.)
      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // ⭐ Successful login
      localStorage.setItem("pnUser", JSON.stringify(data.user));
      localStorage.setItem("pnToken", data.token);

      navigate(`${BASE}`, { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
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
          Pulse Roll Label Products
        </h4>

        <p className="text-center text-secondary mb-4">Sign in to continue</p>

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
            <button
              className="btn btn-info text-white fw-semibold"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
