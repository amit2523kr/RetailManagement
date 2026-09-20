import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className={`toast-notification ${toast.type}`}>
      {toast.type === "success" ? (
        <CheckCircle2 size={18} color="#16a34a" />
      ) : (
        <AlertTriangle size={18} color="#dc2626" />
      )}
      <span>{toast.message}</span>
    </div>
  );
}
