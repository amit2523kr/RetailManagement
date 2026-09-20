import React from "react";
import { Modal } from "../common/Modal.jsx";
import { ALL_AVAILABLE_PERMISSIONS } from "../../utils/constants.js";

export function RoleModal({
  isOpen,
  onClose,
  newRoleForm,
  setNewRoleForm,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Custom Role">
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Role Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Night Shift Auditor, Regional Dispatcher"
              value={newRoleForm.name}
              onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
            />
          </div>
          <div className="form-group span-2">
            <label>Description</label>
            <input
              type="text"
              placeholder="Brief summary of duties and responsibilities..."
              value={newRoleForm.description}
              onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
            />
          </div>
          <div className="form-group span-2">
            <label>Select Initial Permissions</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 200, overflowY: "auto", padding: 8, background: "#f8fafc", borderRadius: 6 }}>
              {ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                const isChecked = newRoleForm.permissions.includes(perm.key);
                return (
                  <label key={perm.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const updated = isChecked
                          ? newRoleForm.permissions.filter(p => p !== perm.key)
                          : [...newRoleForm.permissions, perm.key];
                        setNewRoleForm({ ...newRoleForm, permissions: updated });
                      }}
                    />
                    {perm.label}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">Create Custom Role</button>
        </div>
      </form>
    </Modal>
  );
}
