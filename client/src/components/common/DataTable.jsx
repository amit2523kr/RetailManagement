import React from "react";
import { getArray, formatHeaderLabel, renderTableCell, compact } from "../../utils/formatters.js";

export function Table({ title, rows, columns, actionButton }) {
  const safeRows = getArray(rows);

  return (
    <div className="table-wrap">
      <div className="table-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{title}</h2>
        {actionButton}
      </div>
      {safeRows.length === 0 ? (
        <div style={{ padding: 20, color: "var(--muted)" }}>No records found for this view.</div>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{formatHeaderLabel(column)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeRows.map((row, index) => (
              <tr key={row.id || row._id || index}>
                {columns.map((column) => (
                  <td key={column}>{renderTableCell(row[column], column)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function Card({ title, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function Bars({ rows }) {
  const safeRows = getArray(rows);
  const max = Math.max(1, ...safeRows.map((row) => Number(row.value || 0)));

  return (
    <div className="bars">
      {safeRows.map((row, idx) => (
        <div className="bar-row" key={`${row.label}-${idx}`}>
          <span>{row.label}</span>
          <div className="track">
            <div
              className={`bar ${row.tone === "warn" ? "warn" : row.tone === "hot" ? "hot" : ""}`}
              style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
            />
          </div>
          <strong>{compact(row.value)}</strong>
        </div>
      ))}
    </div>
  );
}
