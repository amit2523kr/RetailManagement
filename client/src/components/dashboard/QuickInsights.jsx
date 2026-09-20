import React from "react";
import { AlertTriangle, Clock } from "lucide-react";

export function LowStockAlertsVisual({ data }) {
  const products = data?.lowStockProducts || [
    { name: "Toned Milk 1L", brand: "Amul", currentStock: 28, minimumStockLevel: 40 },
    { name: "Classic Salted Chips", brand: "Lays", currentStock: 12, minimumStockLevel: 35 }
  ];

  return (
    <div className="table-wrap" style={{ background: "white", borderRadius: 14, boxShadow: "var(--shadow-sm)", flex: 1 }}>
      <div className="table-title" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <AlertTriangle size={18} color="var(--accent-2)" />
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Low Stock Products & Reorder Alerts</h2>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--line)" }}>
            <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>NAME</th>
            <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>BRAND</th>
            <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>CURRENT STOCK</th>
            <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>MIN LEVEL</th>
            <th style={{ padding: "10px 20px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {products.map((row) => (
            <tr key={row.name} style={{ borderBottom: "1px solid var(--line)" }}>
              <td style={{ padding: "12px 20px", fontWeight: 600 }}>{row.name}</td>
              <td style={{ padding: "12px 20px", color: "var(--ink-secondary)" }}>{row.brand || "Generic"}</td>
              <td style={{ padding: "12px 20px", color: "var(--accent-2)", fontWeight: 700 }}>{row.currentStock}</td>
              <td style={{ padding: "12px 20px", color: "var(--ink)" }}>{row.minimumStockLevel}</td>
              <td style={{ padding: "12px 20px", textAlign: "right" }}>
                <button style={{
                  padding: "6px 14px", background: "#ffffff", border: "1px solid var(--line)",
                  borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--ink)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)", cursor: "pointer"
                }}>
                  Reorder Now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NearExpiryFefoVisual({ data }) {
  const nearExpiryItems = data?.nearExpiryProducts || [
    { batchNo: "BAT-9021", name: "Amul Taaza Milk 500ml", expiryDate: "2026-09-28", qty: 45, daysLeft: 8 },
    { batchNo: "BAT-8840", name: "Mother Dairy Dahi 400g", expiryDate: "2026-10-05", qty: 30, daysLeft: 15 }
  ];

  return (
    <div className="table-wrap" style={{ background: "white", borderRadius: 14, boxShadow: "var(--shadow-sm)", flex: 1 }}>
      <div className="table-title" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <Clock size={18} color="#d97706" />
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Near-Expiry FEFO Stock Alerts (&lt;30 Days)</h2>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--line)" }}>
            <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>BATCH NO</th>
            <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>PRODUCT NAME</th>
            <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>EXPIRY DATE</th>
            <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>BATCH QTY</th>
            <th style={{ padding: "10px 20px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>DISPOSITION</th>
          </tr>
        </thead>
        <tbody>
          {nearExpiryItems.map((row) => (
            <tr key={row.batchNo} style={{ borderBottom: "1px solid var(--line)" }}>
              <td style={{ padding: "12px 20px" }}><code>{row.batchNo}</code></td>
              <td style={{ padding: "12px 20px", fontWeight: 600 }}>{row.name}</td>
              <td style={{ padding: "12px 20px", color: "var(--ink-secondary)" }}>
                {row.expiryDate} <span className="badge badge-yellow" style={{ marginLeft: 6 }}>{row.daysLeft}d left</span>
              </td>
              <td style={{ padding: "12px 20px", fontWeight: 600 }}>{row.qty}</td>
              <td style={{ padding: "12px 20px", textAlign: "right" }}>
                <span className="badge badge-red" style={{ cursor: "pointer" }}>
                  FEFO Priority
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QuickInsights({ data }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20, marginTop: 20 }}>
      <LowStockAlertsVisual data={data} />
      <NearExpiryFefoVisual data={data} />
    </div>
  );
}
