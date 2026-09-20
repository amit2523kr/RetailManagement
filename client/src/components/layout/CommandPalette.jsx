import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { getArray, money } from "../../utils/formatters.js";

export function CommandPalette({ data, setView, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const products = getArray(data?.products);
  const customers = getArray(data?.customers);
  const suppliers = getArray(data?.suppliers);
  const sales = getArray(data?.sales);
  const invoices = getArray(data?.invoices);

  const navigationItems = [
    { type: "nav", id: "dashboard", title: "Go to Dashboard", category: "Navigation", subtitle: "KPIs, charts, and business metrics", action: () => { setView("dashboard"); onClose(); } },
    { type: "nav", id: "products", title: "Go to Products Catalog", category: "Navigation", subtitle: "Manage catalog, SKUs, and pricing", action: () => { setView("products"); onClose(); } },
    { type: "nav", id: "inventory", title: "Go to Inventory & Ledger", category: "Navigation", subtitle: "Stock adjustments and movement history", action: () => { setView("inventory"); onClose(); } },
    { type: "nav", id: "orders", title: "Go to Orders (Sales & Purchases)", category: "Navigation", subtitle: "Create and receive purchase & sales orders", action: () => { setView("orders"); onClose(); } },
    { type: "nav", id: "finance", title: "Go to Finance & Payments", category: "Navigation", subtitle: "Invoices, payment reconciliation, and expenses", action: () => { setView("finance"); onClose(); } },
    { type: "nav", id: "admin", title: "Go to Admin & Audit Logs", category: "Navigation", subtitle: "Users, permissions, and audit logs", action: () => { setView("admin"); onClose(); } },
    { type: "nav", id: "copilot", title: "Go to AI Business Copilot", category: "Navigation", subtitle: "Business insights and automated intelligence", action: () => { setView("copilot"); onClose(); } }
  ];

  const q = query.toLowerCase().trim();

  // Filter products
  const matchedProducts = products.filter(p => 
    !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
  ).slice(0, 5).map(p => ({
    type: "product",
    id: p.id || p.sku,
    title: p.name,
    subtitle: `SKU: ${p.sku} · Stock: ${p.currentStock || 0} · Price: ${money(p.sellingPrice)}`,
    category: "Products",
    badge: `${p.currentStock || 0} in stock`,
    action: () => { setView("products"); onClose(); }
  }));

  // Filter customers
  const matchedCustomers = customers.filter(c =>
    !q || c.name?.toLowerCase().includes(q) || c.businessName?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q)
  ).slice(0, 4).map(c => ({
    type: "customer",
    id: c.id,
    title: c.name,
    subtitle: `Outstanding: ${money(c.outstanding)} · ${c.phone || ""}`,
    category: "Customers",
    badge: money(c.outstanding),
    action: () => { setView("orders"); onClose(); }
  }));

  // Filter suppliers
  const matchedSuppliers = suppliers.filter(s =>
    !q || s.name?.toLowerCase().includes(q) || s.contact?.toLowerCase().includes(q)
  ).slice(0, 4).map(s => ({
    type: "supplier",
    id: s.id,
    title: s.name,
    subtitle: `Payable: ${money(s.outstanding)} · Contact: ${s.contact || "-"}`,
    category: "Suppliers",
    badge: money(s.outstanding),
    action: () => { setView("orders"); onClose(); }
  }));

  // Filter orders & invoices
  const matchedOrders = [
    ...sales.map(s => ({
      type: "order",
      id: s.id,
      title: `Sales Order #${s.id}`,
      subtitle: `${s.customerName || "Customer"} · Total: ${money(s.total)} · Status: ${s.status}`,
      category: "Sales Orders",
      badge: s.status,
      action: () => { setView("orders"); onClose(); }
    })),
    ...invoices.map(inv => ({
      type: "invoice",
      id: inv.id,
      title: `Invoice #${inv.id}`,
      subtitle: `${inv.customerName || "Customer"} · Total: ${money(inv.total)} · Status: ${inv.status}`,
      category: "Invoices",
      badge: inv.status,
      action: () => { setView("finance"); onClose(); }
    }))
  ].filter(item => !q || item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)).slice(0, 4);

  const matchedNav = navigationItems.filter(item => !q || item.title.toLowerCase().includes(q));

  const allResults = [
    ...matchedNav,
    ...matchedProducts,
    ...matchedCustomers,
    ...matchedSuppliers,
    ...matchedOrders
  ];

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(1, allResults.length));
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      e.preventDefault();
      allResults[selectedIndex].action();
    }
  };

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="command-input-wrap">
          <Search size={18} style={{ color: "var(--muted)" }} />
          <input
            type="text"
            autoFocus
            placeholder="Search products, customers, suppliers, orders, or type a view..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="command-results-list">
          {allResults.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>
              No matching records or actions found for "{query}".
            </div>
          ) : (
            allResults.map((item, idx) => (
              <div
                key={`${item.category}-${item.id || idx}`}
                className={`command-item ${selectedIndex === idx ? "selected" : ""}`}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="command-item-left">
                  <span className="badge badge-blue" style={{ fontSize: 10 }}>{item.category}</span>
                  <div>
                    <strong>{item.title}</strong>
                    {item.subtitle && <small style={{ display: "block", color: "var(--muted)", fontSize: 11.5 }}>{item.subtitle}</small>}
                  </div>
                </div>
                {item.badge && <span className="command-item-badge">{item.badge}</span>}
              </div>
            ))
          )}
        </div>

        <div className="command-footer">
          <span><kbd style={{ padding: "2px 5px", background: "white", border: "1px solid var(--line)", borderRadius: 3 }}>↑↓</kbd> to navigate</span>
          <span><kbd style={{ padding: "2px 5px", background: "white", border: "1px solid var(--line)", borderRadius: 3 }}>↵</kbd> to select</span>
          <span><kbd style={{ padding: "2px 5px", background: "white", border: "1px solid var(--line)", borderRadius: 3 }}>esc</kbd> to dismiss</span>
        </div>
      </div>
    </div>
  );
}
