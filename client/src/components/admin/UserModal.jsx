import React from "react";
import { Modal } from "../common/Modal.jsx";

export function UserModal({
  isOpen,
  onClose,
  newUserForm,
  setNewUserForm,
  roles,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User & Assign Role">
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={newUserForm.name}
              onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
            />
          </div>
          <div className="form-group span-2">
            <label>Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. ramesh@retailplatform.com"
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
            />
          </div>
          <div className="form-group span-2">
            <label>Assign Dynamic Role *</label>
            <select
              value={newUserForm.role}
              onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
              required
            >
              {roles.map((r) => (
                <option key={r.id || r.name} value={r.id || r.name}>
                  {r.name} — {r.description || (r.isSystemRole ? "System Default" : "Custom")}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">Create & Assign User</button>
        </div>
      </form>
    </Modal>
  );
}
