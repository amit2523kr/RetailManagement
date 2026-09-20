export async function api(path, headers) {
  const response = await fetch(path, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function loadViewData(view, range, headers) {
  try {
    if (view === "dashboard") {
      return await api(`/api/dashboard?range=${range}`, headers);
    }
    if (view === "products") {
      const res = await api("/api/products", headers).catch(() => ({ data: [] }));
      return { products: res };
    }
    if (view === "inventory") {
      const [prods, movs] = await Promise.all([
        api("/api/products", headers).catch(() => ({ data: [] })),
        api("/api/inventory/movements", headers).catch(() => ({ data: [] }))
      ]);
      return { products: prods, movements: movs };
    }
    if (view === "orders") {
      const [sales, purchases, prods, custs, sups, chns] = await Promise.all([
        api("/api/sales-orders", headers).catch(() => ({ data: [] })),
        api("/api/purchase-orders", headers).catch(() => ({ data: [] })),
        api("/api/products", headers).catch(() => ({ data: [] })),
        api("/api/customers", headers).catch(() => ({ data: [] })),
        api("/api/suppliers", headers).catch(() => ({ data: [] })),
        api("/api/channels", headers).catch(() => ({ data: [] }))
      ]);
      return { sales, purchases, products: prods, customers: custs, suppliers: sups, channels: chns };
    }
    if (view === "returns") {
      const [returnsList, sales, prods, custs] = await Promise.all([
        api("/api/returns", headers).catch(() => ({ data: [] })),
        api("/api/sales-orders", headers).catch(() => ({ data: [] })),
        api("/api/products", headers).catch(() => ({ data: [] })),
        api("/api/customers", headers).catch(() => ({ data: [] }))
      ]);
      return { returns: returnsList, sales, products: prods, customers: custs };
    }
    if (view === "customers") {
      const res = await api("/api/customers", headers).catch(() => ({ data: [] }));
      return { customers: res };
    }
    if (view === "suppliers") {
      const res = await api("/api/suppliers", headers).catch(() => ({ data: [] }));
      return { suppliers: res };
    }
    if (view === "finance") {
      const [invoices, payments, expenses, custs, sups] = await Promise.all([
        api("/api/invoices", headers).catch(() => ({ data: [] })),
        api("/api/payments", headers).catch(() => ({ data: [] })),
        api("/api/expenses", headers).catch(() => ({ data: [] })),
        api("/api/customers", headers).catch(() => ({ data: [] })),
        api("/api/suppliers", headers).catch(() => ({ data: [] }))
      ]);
      return { invoices, payments, expenses, customers: custs, suppliers: sups };
    }
    if (view === "admin") {
      const [users, roles, auditLogs, notifications] = await Promise.all([
        api("/api/users", headers).catch(() => ({ data: [] })),
        api("/api/roles", headers).catch(() => ({ data: [] })),
        api("/api/audit-logs", headers).catch(() => ({ data: [] })),
        api("/api/notifications", headers).catch(() => ({ data: [] }))
      ]);
      return { users, roles, audit: auditLogs, notifications };
    }
    if (view === "copilot") {
      return await api("/api/copilot/insights", headers).catch(() => ({ recommendations: [] }));
    }
  } catch (err) {
    console.error("loadViewData error:", err);
    return {};
  }
}
