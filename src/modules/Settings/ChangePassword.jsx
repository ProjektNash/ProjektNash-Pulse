import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("pnUser") || "{}");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

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
      const res = await fetch(`${API_BASE}/api/users/${user.id}/set-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: form.newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to update password");
      } else {
        setMessage("Password updated!");
        setTimeout(() => navigate("/settings"), 1200);
      }
    } catch (err) {
      console.error("Update password error:", err);
      setMessage("Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "480px" }}>
      <h3 className="mb-3">Change Password</h3>

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
          {saving ? "Saving..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
