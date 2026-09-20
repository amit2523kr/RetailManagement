import React, { useState } from "react";
import { getArray } from "../../utils/formatters.js";
import { UsersTable } from "./UsersTable.jsx";
import { UserModal } from "./UserModal.jsx";
import { RoleMatrix } from "./RoleMatrix.jsx";
import { RoleModal } from "./RoleModal.jsx";
import { AuditLogsTable } from "./AuditLogsTable.jsx";

export function AdminView({ data, setData, headers, showToast, refreshData }) {
  const users = getArray(data.users);
  const roles = getArray(data.roles);
  const auditLogs = getArray(data.audit);
  const notifications = getArray(data.notifications);

  const [selectedRole, setSelectedRole] = useState(null);
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: "", description: "", permissions: [] });

  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", role: "SALES_STAFF" });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers,
        body: JSON.stringify(newUserForm)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || "Failed to create user");
      }
      if (showToast) showToast(`User '${newUserForm.name}' created with role '${newUserForm.role}'!`, "success");
      setIsNewUserModalOpen(false);
      setNewUserForm({ name: "", email: "", role: roles[0]?.id || "SALES_STAFF" });
      if (refreshData) refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.role === "SUPER_ADMIN") {
      alert("Super Admin user cannot be deleted.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user '${user.name}'?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id || user._id}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete user");
      }
      if (showToast) showToast(`User '${user.name}' deleted.`, "success");
      if (refreshData) refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTogglePermission = (permissionKey) => {
    if (!selectedRole) return;
    const current = selectedRole.permissions || [];
    const updated = current.includes(permissionKey)
      ? current.filter(p => p !== permissionKey)
      : [...current, permissionKey];
    setSelectedRole({ ...selectedRole, permissions: updated });
  };

  const handleSaveRoleMatrix = async () => {
    if (!selectedRole) return;
    try {
      const res = await fetch(`/api/roles/${selectedRole.id || selectedRole._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          permissions: selectedRole.permissions,
          description: selectedRole.description
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save role permissions");
      }
      if (showToast) showToast(`Permissions updated for role '${selectedRole.name}'!`, "success");
      if (refreshData) refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateCustomRole = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers,
        body: JSON.stringify(newRoleForm)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create custom role");
      }
      if (showToast) showToast(`Custom Role '${newRoleForm.name}' created!`, "success");
      setIsNewRoleModalOpen(false);
      setNewRoleForm({ name: "", description: "", permissions: [] });
      if (refreshData) refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteCustomRole = async (role) => {
    if (role.isSystemRole) {
      alert("System default roles cannot be deleted.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete custom role '${role.name}'?`)) return;
    try {
      const res = await fetch(`/api/roles/${role.id || role._id}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete role");
      }
      if (showToast) showToast(`Role '${role.name}' deleted.`, "success");
      if (selectedRole?.id === role.id) setSelectedRole(null);
      if (refreshData) refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <UsersTable
        users={users}
        roles={roles}
        onOpenCreateUser={() => {
          setNewUserForm({ name: "", email: "", role: roles[0]?.id || "SALES_STAFF" });
          setIsNewUserModalOpen(true);
        }}
        onDeleteUser={handleDeleteUser}
      />

      <UserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        newUserForm={newUserForm}
        setNewUserForm={setNewUserForm}
        roles={roles}
        onSubmit={handleCreateUser}
      />

      <RoleMatrix
        roles={roles}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onOpenCreateRole={() => setIsNewRoleModalOpen(true)}
        onDeleteCustomRole={handleDeleteCustomRole}
        onTogglePermission={handleTogglePermission}
        onSaveRoleMatrix={handleSaveRoleMatrix}
      />

      <RoleModal
        isOpen={isNewRoleModalOpen}
        onClose={() => setIsNewRoleModalOpen(false)}
        newRoleForm={newRoleForm}
        setNewRoleForm={setNewRoleForm}
        onSubmit={handleCreateCustomRole}
      />

      <AuditLogsTable
        auditLogs={auditLogs}
        notifications={notifications}
      />
    </>
  );
}
