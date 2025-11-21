import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordFirstTime() {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const BASE = import.meta.env.BASE_URL;
  const navigate = useNavigate();

  const userId = localStorage.getItem("pnForcePasswordChangeUserId");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  if (!userId) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          Invalid session. Please log in again.
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`${BASE}login`)}
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return setMessage("Passwords do not match");
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/set-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: form.newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to change password");
      } else {
        localStorage.removeItem("pnForcePasswordChangeUserId");
        setMessage("Password updated! Redirecting...");
        setTimeout(() => navigate(`${BASE}login`), 1200);
      }
    } catch (err) {
      console.error("Password change error:", err);
      setMessage("Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "480px" }}>
      <h3 className="mb-3 text-center">Set a New Password</h3>
      <p className="text-muted text-center">
        This is required before your first login.
      </p>

      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            name="newPassword"
            className="form-control"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button className="btn btn-primary w-100" disabled={saving}>
          {saving ? "Saving..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}
