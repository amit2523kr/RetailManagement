import React from "react";
import { money, compact } from "../../utils/formatters.js";

export function Metric({ label, value, caption, sparkline, gauge }) {
  return (
    <article className="metric" style={{ background: "white", borderRadius: 14, padding: "18px 20px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <small style={{ color: "var(--muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</small>
          <strong style={{ display: "block", margin: "6px 0 4px", fontSize: 24, fontWeight: 800, color: "var(--ink)" }}>{value}</strong>
        </div>
        {sparkline && (
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none" style={{ marginTop: 4 }}>
            <path d="M2 24 C 15 18, 25 28, 38 12 C 48 2, 52 14, 58 6" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
        {gauge && (
          <div style={{ width: 64, height: 40, position: "relative" }}>
            <svg width="64" height="40" viewBox="0 0 64 40">
              <path d="M 8 36 A 26 26 0 0 1 56 36" fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
              <path d="M 8 36 A 26 26 0 0 1 24 13" fill="none" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
              <path d="M 24 13 A 26 26 0 0 1 42 13" fill="none" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" />
              <path d="M 42 13 A 26 26 0 0 1 56 36" fill="none" stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
              <line x1="32" y1="36" x2="46" y2="18" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              <circle cx="32" cy="36" r="3.5" fill="#1e293b" />
            </svg>
          </div>
        )}
      </div>
      <span style={{ color: "var(--muted)", fontSize: 11.5 }}>{caption}</span>
    </article>
  );
}

export function KpiCards({ kpis }) {
  const k = kpis || { todaysSales: 456, monthSales: 19477, grossProfit: 0, netProfit: 0, inventoryValue: 15523, lowStockCount: 2, outOfStockCount: 0 };

  return (
    <section className="kpi-grid">
      <Metric label="TODAY'S SALES" value={money(k.todaysSales || 456)} caption="Point-in-time trading" sparkline />
      <Metric label="MONTH SALES" value={money(k.monthSales || 19477)} caption="Revenue including tax" sparkline />
      <Metric label="GROSS PROFIT" value={money(k.grossProfit || 0)} caption="Sales less COGS" sparkline />
      <Metric label="NET PROFIT" value={money(k.netProfit || 0)} caption="After operating expenses" sparkline />
      <Metric label="INVENTORY VALUE" value={money(k.inventoryValue || 15523)} caption={`${k.lowStockCount || 2} low level · ${k.outOfStockCount || 0} out`} gauge />
    </section>
  );
}
