import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { ALL_AVAILABLE_PERMISSIONS } from "../../utils/constants.js";

export function RoleMatrix({
  roles,
  selectedRole,
  setSelectedRole,
  onOpenCreateRole,
  onDeleteCustomRole,
  onTogglePermission,
  onSaveRoleMatrix
}) {
  return (
    <div className="panel" style={{ background: "white", borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Dynamic RBAC Role & Permission Matrix</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--muted)" }}>Configure granular permissions for roles or create new custom business roles.</p>
        </div>
        <button className="primary-btn" onClick={onOpenCreateRole}>
          <Plus size={16} /> Create Custom Role
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
        {/* Left Role Selection List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Available Roles ({roles.length})</span>
          {roles.map((r) => {
            const isSelected = selectedRole?.id === r.id || selectedRole?.name === r.name;
            return (
              <div
                key={r.id || r.name}
                onClick={() => setSelectedRole(r)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: isSelected ? "var(--accent)" : "var(--line)",
                  background: isSelected ? "var(--accent-light)" : "var(--surface-hover)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <strong style={{ fontSize: 13, display: "block" }}>{r.name}</strong>
                  <small style={{ fontSize: 11, color: "var(--muted)" }}>{r.isSystemRole ? "System Default" : "Custom Role"}</small>
                </div>
                {!r.isSystemRole && (
                  <button className="icon-btn delete" style={{ padding: 4 }} onClick={(e) => { e.stopPropagation(); onDeleteCustomRole(r); }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Permission Checkbox Matrix */}
        <div>
          {!selectedRole ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", background: "#f8fafc", borderRadius: 8 }}>
              Select a role from the left menu to view or configure its granular permissions.
            </div>
          ) : (
            <div style={{ background: "#f8fafc", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15 }}>Configure Permissions for <strong>{selectedRole.name}</strong></h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>{selectedRole.description || "DB-backed dynamic role"}</p>
                </div>
                <button className="primary-btn" onClick={onSaveRoleMatrix}>
                  Save Permissions
                </button>
              </div>

              {selectedRole.permissions?.includes("*") ? (
                <div style={{ padding: 16, background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, color: "#047857", fontSize: 13, fontWeight: 600 }}>
                  ⚡ Super Admin has full unrestricted global access (`*`).
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = selectedRole.permissions?.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          background: "white",
                          border: "1px solid var(--line)",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12.5
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onTogglePermission(perm.key)}
                        />
                        <div>
                          <strong>{perm.label}</strong>
                          <small style={{ display: "block", color: "var(--muted)", fontSize: 11 }}>Key: <code>{perm.key}</code></small>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
