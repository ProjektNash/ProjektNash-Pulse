import React, { useEffect, useState } from "react";

export default function UserManagement() {
  const API_BASE = import.meta.env.VITE_API_BASE;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [newUser, setNewUser] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "user",
    allowedModules: [],
  });

  const token = localStorage.getItem("pnToken");

  const moduleOptions = [
    { id: "dashboard", label: "Dashboard" },
    { id: "safety", label: "Safety" },
    { id: "assets", label: "Assets" },
    { id: "businessPartners", label: "Business Partners" },
    { id: "maintenance", label: "Maintenance" },
    { id: "preventiveMaintenance", label: "Preventive Maintenance" },
    { id: "maintenanceCalendar", label: "Maintenance Calendar" },
    { id: "digitalLabBook", label: "Digital Lab Book" },
  ];

  /* ==========================================================
     Load all users
  ========================================================== */
  const loadUsers = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to load users");
      } else {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setMessage("Server error while loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ==========================================================
     Create user
  ========================================================== */
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const toggleNewUserModule = (moduleId) => {
    setNewUser((prev) => ({
      ...prev,
      allowedModules: prev.allowedModules.includes(moduleId)
        ? prev.allowedModules.filter((m) => m !== moduleId)
        : [...prev.allowedModules, moduleId],
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to create user");
      } else {
        setMessage("User created");

        setNewUser({
          username: "",
          displayName: "",
          password: "",
          role: "user",
          allowedModules: [],
        });

        await loadUsers();
      }
    } catch (err) {
      console.error("Create user error:", err);
      setMessage("Server error while creating user");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     Update user modules
  ========================================================== */
  const toggleUserModule = async (userId, moduleId) => {
    setSaving(true);
    setMessage("");

    try {
      const theUser = users.find((u) => u.id === userId);
      if (!theUser) return;

      const updated = theUser.allowedModules.includes(moduleId)
        ? theUser.allowedModules.filter((m) => m !== moduleId)
        : [...theUser.allowedModules, moduleId];

      const res = await fetch(`${API_BASE}/api/users/${userId}/modules`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ allowedModules: updated }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to update permissions");
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, allowedModules: updated } : u
          )
        );
        setMessage("Permissions updated");
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("Server error while updating permissions");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     Update user role
  ========================================================== */
  const updateUserRole = async (userId, newRole) => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/basic`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.message || "Failed to update role");
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: newRole } : u
          )
        );
        setMessage("Role updated");
      }
    } catch (err) {
      console.error("Role update error:", err);
      setMessage("Server error while updating role");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     Toggle active/inactive
  ========================================================== */
  const toggleUserActive = async (userId, currentValue) => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/active`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !currentValue }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.message || "Failed to update active status");
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, active: !currentValue } : u
          )
        );
        setMessage("User status updated");
      }
    } catch (err) {
      console.error("Active status error:", err);
      setMessage("Server error while updating active status");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     Delete user
  ========================================================== */
  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.message || "Failed to delete user");
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setMessage("User deleted");
      }
    } catch (err) {
      console.error("Delete user error:", err);
      setMessage("Server error while deleting user");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     Render JSX
  ========================================================== */
  return (
    <div className="container py-3">
      <h2 className="mb-3">User Management</h2>

      {message && <div className="alert alert-info">{message}</div>}

      {/* CREATE USER */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Create New User</h5>

          <form onSubmit={handleCreateUser}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={newUser.username}
                  onChange={handleNewUserChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  className="form-control"
                  value={newUser.displayName}
                  onChange={handleNewUserChange}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-select"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <small className="text-muted">Module Access</small>
              <div className="d-flex flex-wrap">
                {moduleOptions.map((mod) => (
                  <div key={mod.id} className="form-check me-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`new-${mod.id}`}
                      checked={newUser.allowedModules.includes(mod.id)}
                      onChange={() => toggleNewUserModule(mod.id)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`new-${mod.id}`}
                    >
                      {mod.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Create User"}
            </button>
          </form>
        </div>
      </div>

      {/* EXISTING USERS */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Existing Users</h5>

          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Display Name</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th>Modules</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.displayName}</td>

                      {/* ROLE */}
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={u.role}
                          onChange={(e) =>
                            updateUserRole(u.id, e.target.value)
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* ACTIVE */}
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={u.active}
                            onChange={() =>
                              toggleUserActive(u.id, u.active)
                            }
                          />
                        </div>
                      </td>

                      {/* MODULES */}
                      <td>
                        <div className="d-flex flex-wrap">
                          {moduleOptions.map((mod) => (
                            <div
                              key={mod.id}
                              className="form-check form-check-inline me-2"
                            >
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`${u.id}-${mod.id}`}
                                checked={u.allowedModules.includes(mod.id)}
                                onChange={() =>
                                  toggleUserModule(u.id, mod.id)
                                }
                              />
                              <label
                                className="form-check-label small"
                                htmlFor={`${u.id}-${mod.id}`}
                              >
                                {mod.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* DELETE BUTTON */}
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteUser(u.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
