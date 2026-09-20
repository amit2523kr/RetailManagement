import React from "react";
import { Plus, Trash2 } from "lucide-react";

export function UsersTable({ users, roles, onOpenCreateUser, onDeleteUser }) {
  return (
    <div className="table-wrap">
      <div className="table-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>System Users & Dynamic Role Assignments</h2>
          <small style={{ color: "var(--muted)" }}>Manage platform user accounts and dynamic role assignments</small>
        </div>
        <button className="primary-btn" onClick={onOpenCreateUser}>
          <Plus size={16} /> Create User
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email</th>
            <th>Assigned Dynamic Role</th>
            <th style={{ textAlign: "right", width: 90 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const roleObj = roles.find((r) => r.id === u.role || r.name === u.role);
            const roleLabel = roleObj?.name || u.role;
            return (
              <tr key={u.id || u._id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${roleObj?.isSystemRole ? "badge-blue" : "badge-green"}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {roleLabel}
                    {roleObj?.isSystemRole && <small style={{ opacity: 0.7, fontSize: 10 }}>(Default)</small>}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  {u.role !== "SUPER_ADMIN" && (
                    <button className="icon-btn delete" title="Delete User" onClick={() => onDeleteUser(u)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
