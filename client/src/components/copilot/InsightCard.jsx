import React from "react";

export function InsightCard({ title, rationale, action, priority = "RECOMMENDED" }) {
  return (
    <div className="insight">
      <small>{priority}</small>
      <strong>{title}</strong>
      {rationale && <p>{rationale}</p>}
      {action && <p><strong>Action:</strong> {action}</p>}
    </div>
  );
}
