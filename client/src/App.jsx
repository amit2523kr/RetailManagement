import React, { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { Header } from "./components/layout/Header.jsx";
import { CommandPalette } from "./components/layout/CommandPalette.jsx";
import { Toast } from "./components/common/Toast.jsx";
import { VIEWS } from "./utils/constants.js";
import { api, loadViewData } from "./api/client.js";

import { DashboardView } from "./components/dashboard/DashboardView.jsx";
import { ProductsView } from "./components/products/ProductsView.jsx";
import { InventoryView } from "./components/inventory/InventoryView.jsx";
import { OrdersView } from "./components/orders/OrdersView.jsx";
import { CustomersView } from "./components/partners/CustomersView.jsx";
import { SuppliersView } from "./components/partners/SuppliersView.jsx";
import { ReturnsView } from "./components/returns/ReturnsView.jsx";
import { FinanceView } from "./components/finance/FinanceView.jsx";
import { AdminView } from "./components/admin/AdminView.jsx";
import { CopilotView } from "./components/copilot/CopilotView.jsx";

export function View({ view, data, setData, headers, showToast, refreshData, onNavigateView }) {
  if (view === "dashboard") return <DashboardView data={data} />;
  if (view === "products") return <ProductsView data={data} setData={setData} headers={headers} showToast={showToast} refreshData={refreshData} />;
  if (view === "inventory") return <InventoryView data={data} headers={headers} showToast={showToast} refreshData={refreshData} />;
  if (view === "orders") return <OrdersView data={data} headers={headers} showToast={showToast} refreshData={refreshData} />;
  if (view === "returns") return <ReturnsView data={data} headers={headers} showToast={showToast} refreshData={refreshData} />;
  if (view === "customers") return <CustomersView data={data} headers={headers} showToast={showToast} refreshData={refreshData} />;
  if (view === "suppliers") return <SuppliersView data={data} headers={headers} showToast={showToast} refreshData={refreshData} />;
  if (view === "finance") return <FinanceView data={data} headers={headers} showToast={showToast} refreshData={refreshData} />;
  if (view === "admin") return <AdminView data={data} setData={setData} headers={headers} showToast={showToast} refreshData={refreshData} />;
  if (view === "copilot") return <CopilotView data={data} headers={headers} onNavigateView={onNavigateView} />;
  return null;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("retailops_token") || "owner-token");
  const [view, setView] = useState("orders");
  const [range, setRange] = useState("last30");
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const activeView = VIEWS.find((item) => item.id === view) || VIEWS[0];
  const headers = useMemo(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }), [token]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem("retailops_token", token);
  }, [token]);

  const refreshData = async () => {
    setError("");
    setLoading(true);
    try {
      const [profile, payload] = await Promise.all([
        api("/api/me", headers).catch(() => ({ user: { name: "Demo User", role: "BUSINESS_OWNER" } })),
        loadViewData(view, range, headers)
      ]);
      setMe(profile);
      setData(payload || {});
    } catch (err) {
      setError(`${err.message}. Try switching demo roles in the sidebar.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError("");
      setLoading(true);
      try {
        const [profile, payload] = await Promise.all([
          api("/api/me", headers).catch(() => ({ user: { name: "Demo User", role: "BUSINESS_OWNER" } })),
          loadViewData(view, range, headers)
        ]);
        if (!cancelled) {
          setMe(profile);
          setData(payload || {});
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(`${err.message}. Try switching demo roles in the sidebar.`);
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [headers, range, view]);

  return (
    <div className="app-shell">
      <Sidebar
        token={token}
        setToken={setToken}
        view={view}
        setView={setView}
        me={me}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <main>
        <Header
          activeView={activeView}
          range={range}
          setRange={setRange}
          refreshData={refreshData}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        <Toast toast={toast} />

        <section className="content">
          {error && (
            <div className="panel">
              <h2>Access Warning</h2>
              <p style={{ color: "var(--accent-2)" }}>{error}</p>
            </div>
          )}
          {loading && (
            <div className="panel">
              <h2>Loading</h2>
              <p>Fetching {activeView.label.toLowerCase()} data...</p>
            </div>
          )}
          {!loading && data && (
            <View
              view={view}
              data={data}
              setData={setData}
              headers={headers}
              showToast={showToast}
              refreshData={refreshData}
              onNavigateView={setView}
            />
          )}
        </section>

        {isCommandPaletteOpen && (
          <CommandPalette
            data={data}
            setView={setView}
            onClose={() => setIsCommandPaletteOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
