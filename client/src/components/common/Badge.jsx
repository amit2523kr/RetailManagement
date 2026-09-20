import React from "react";

export function Badge({ children, variant = "blue", className = "", style }) {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {children}
    </span>
  );
}

export function StatusPill({ status = "active", children }) {
  return (
    <span className={`status-pill ${status}`}>
      {children || status.toUpperCase()}
    </span>
  );
}
