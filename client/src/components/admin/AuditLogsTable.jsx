import React from "react";
import { Table } from "../common/DataTable.jsx";

export function AuditLogsTable({ auditLogs, notifications }) {
  return (
    <section className="grid-2">
      <Table
        title="Audit Trail Log"
        rows={auditLogs.slice(0, 15)}
        columns={["action", "entity", "entityId", "createdAt"]}
      />
      <Table
        title="System Notifications"
        rows={notifications}
        columns={["severity", "title", "read", "createdAt"]}
      />
    </section>
  );
}
