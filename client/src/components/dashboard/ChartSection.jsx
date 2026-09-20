import React from "react";

export function Panel({ title, children }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function SalesVsPurchasesVisual() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 60px", gap: 14, alignItems: "center", minHeight: 160 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
        <span>2026-08</span>
        <span>2026-08 PO</span>
        <span>2026-09</span>
        <span>2026-09 PO</span>
      </div>
      <div style={{ width: "100%", height: 130, position: "relative" }}>
        <svg width="100%" height="130" viewBox="0 0 300 130" preserveAspectRatio="none" style={{ overflow: "visible" }}>
          <path d="M 0 30 Q 60 5, 120 40 T 240 15 T 300 35 L 300 125 L 0 125 Z" fill="rgba(15, 118, 110, 0.15)" />
          <path d="M 0 30 Q 60 5, 120 40 T 240 15 T 300 35" fill="none" stroke="#0f766e" strokeWidth="2.5" />

          <line x1="0" y1="48" x2="300" y2="48" stroke="#d97706" strokeWidth="10" strokeLinecap="round" opacity="0.85" />
          <circle cx="15" cy="25" r="4.5" fill="#ffffff" stroke="#0f766e" strokeWidth="3" />
          <circle cx="295" cy="48" r="4.5" fill="#ffffff" stroke="#d97706" strokeWidth="3" />

          <line x1="0" y1="84" x2="230" y2="84" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" opacity="0.85" />
          <circle cx="210" cy="84" r="4.5" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />

          <line x1="0" y1="116" x2="295" y2="116" stroke="#d97706" strokeWidth="10" strokeLinecap="round" opacity="0.85" />
          <circle cx="295" cy="116" r="4.5" fill="#ffffff" stroke="#d97706" strokeWidth="3" />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 12, fontWeight: 700, color: "var(--ink)", textAlign: "right" }}>
        <span>5.6K</span>
        <span>46K</span>
        <span>19.5K</span>
        <span>45K</span>
      </div>
    </div>
  );
}

export function TopProductsVisual() {
  const items = [
    { name: "Maggi Masala 70g", value: "300", pct: 92, icon: "🍜" },
    { name: "Coca-Cola 500ml", value: "225", pct: 72, icon: "🥤" },
    { name: "Pepsi 500ml", value: "138", pct: 48, icon: "🥤" },
    { name: "Classic Salted Chips", value: "60", pct: 24, icon: "🍟" },
    { name: "Toned Milk 1L", value: "37", pct: 14, icon: "🥛" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item) => (
        <div key={item.name} style={{ display: "grid", gridTemplateColumns: "150px 1fr 40px", gap: 12, alignItems: "center", fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, color: "var(--ink)" }}>
            <span>{item.icon}</span>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
          </div>
          <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${item.pct}%`, height: "100%", background: "#0f766e", borderRadius: 999 }} />
          </div>
          <strong style={{ textAlign: "right", color: "var(--ink)", fontWeight: 700 }}>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function CategoryVisual() {
  const items = [
    { label: "Beverages", value: "13.5K", pct: 85 },
    { label: "Snacks", value: "6K", pct: 45 },
    { label: "Dairy", value: "2.3K", pct: 20 }
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "grid", gridTemplateColumns: "90px 1fr 50px", gap: 12, alignItems: "center", fontSize: 13 }}>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{item.label}</span>
          <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${item.pct}%`, height: "100%", background: "#0f766e", borderRadius: 999 }} />
          </div>
          <strong style={{ textAlign: "right", color: "var(--ink)", fontWeight: 700 }}>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function ChannelVisual() {
  const items = [
    { label: "Direct Store", value: "10.9K", pct: 80, color: "#6366f1" },
    { label: "B2B Wholesale", value: "6.2K", pct: 45, color: "#818cf8" },
    { label: "Marketplace", value: "8K", pct: 60, color: "#0f766e" }
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "grid", gridTemplateColumns: "110px 1fr 50px", gap: 12, alignItems: "center", fontSize: 13 }}>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{item.label}</span>
          <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: 999 }} />
          </div>
          <strong style={{ textAlign: "right", color: "var(--ink)", fontWeight: 700 }}>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function CustomerOutstandingVisual() {
  const items = [
    { label: "Bright Mart", value: "22.6K", pct: 85, color: "#22c55e" },
    { label: "Hotel Sunrise", value: "9.8K", pct: 40, color: "#ef4444" },
    { label: "QuickBasket", value: "15.2K", pct: 60, color: "#ef4444" }
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "grid", gridTemplateColumns: "110px 1fr 50px", gap: 12, alignItems: "center", fontSize: 13 }}>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{item.label}</span>
          <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: 999 }} />
          </div>
          <strong style={{ textAlign: "right", color: "var(--ink)", fontWeight: 700 }}>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function ChartSection() {
  return (
    <>
      <section className="grid-2">
        <Panel title="Sales vs Purchases">
          <SalesVsPurchasesVisual />
        </Panel>
        <Panel title="Top Products">
          <TopProductsVisual />
        </Panel>
      </section>

      <section className="grid-3">
        <Panel title="Sales By Category">
          <CategoryVisual />
        </Panel>
        <Panel title="Sales By Channel">
          <ChannelVisual />
        </Panel>
        <Panel title="Customer Outstanding">
          <CustomerOutstandingVisual />
        </Panel>
      </section>
    </>
  );
}
