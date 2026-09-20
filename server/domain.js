export function dashboard(db, range = "last30") {
  const now = new Date();
  const start = rangeStart(now, range);
  const sales = db.salesOrders.filter((order) => new Date(order.orderedAt) >= start);
  const purchases = db.purchaseOrders.filter((order) => new Date(order.orderedAt) >= start);
  const revenue = sales.reduce((sum, order) => sum + order.total, 0);
  const cogs = sales.flatMap((order) => order.lines).reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
  const expenses = db.expenses.filter((item) => new Date(item.spentAt) >= start).reduce((sum, item) => sum + item.amount, 0);
  const inventoryValue = db.products.reduce((sum, product) => sum + product.currentStock * product.purchasePrice, 0);
  const lowStock = db.products.filter((product) => product.currentStock > 0 && product.currentStock <= product.minimumStockLevel);
  const outOfStock = db.products.filter((product) => product.currentStock <= 0);
  const salesByProduct = aggregateLines(db.salesOrders.flatMap((order) => order.lines), "productId", (line) => line.quantity);
  const customerOutstanding = db.customers.reduce((sum, customer) => sum + customer.outstanding, 0);
  const supplierOutstanding = db.suppliers.reduce((sum, supplier) => sum + supplier.outstanding, 0);
  return {
    kpis: {
      todaysSales: totalSince(db.salesOrders, startOfDay(now)),
      monthSales: totalSince(db.salesOrders, new Date(now.getFullYear(), now.getMonth(), 1)),
      totalPurchases: purchases.reduce((sum, order) => sum + order.total, 0),
      grossProfit: revenue - cogs,
      netProfit: revenue - cogs - expenses,
      customerOutstanding,
      supplierOutstanding,
      inventoryValue,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length
    },
    lowStock,
    topProducts: Object.entries(salesByProduct)
      .map(([productId, quantity]) => ({ product: db.products.find((p) => p.id === productId)?.name || productId, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10),
    topCustomers: db.customers.slice().sort((a, b) => b.outstanding - a.outstanding).slice(0, 5),
    recentSales: db.salesOrders.slice(0, 6),
    recentPurchases: db.purchaseOrders.slice(0, 6),
    recentPayments: db.payments.slice(0, 6),
    charts: {
      monthlySales: monthly(db.salesOrders, "orderedAt", "total"),
      monthlyPurchases: monthly(db.purchaseOrders, "orderedAt", "total"),
      profitTrend: profitTrend(db),
      salesVsPurchases: monthlySalesVsPurchases(db),
      salesByCategory: salesByCategory(db),
      salesByChannel: salesByChannel(db),
      customerOutstanding: db.customers.map((customer) => ({ label: customer.name, value: customer.outstanding })),
      inventoryMovement: db.stockMovements.map((movement) => ({ label: movement.createdAt.slice(5, 10), value: movement.quantity }))
    }
  };
}

export function copilotInsights(db) {
  const report = dashboard(db);
  const recommendations = [];
  for (const product of report.lowStock) {
    recommendations.push({
      priority: "HIGH",
      title: `Reorder ${product.name}`,
      rationale: `Current stock is ${product.currentStock}, below the minimum level of ${product.minimumStockLevel}.`,
      action: "Create purchase order"
    });
  }
  if (report.kpis.customerOutstanding > report.kpis.monthSales * 0.7) {
    recommendations.push({
      priority: "MEDIUM",
      title: "Tighten receivables follow-up",
      rationale: "Customer outstanding is high relative to current month sales.",
      action: "Send payment reminders to top outstanding customers"
    });
  }
  const top = report.topProducts[0];
  if (top) {
    recommendations.push({
      priority: "LOW",
      title: `Promote ${top.product}`,
      rationale: "It is currently the fastest-moving product in the catalog.",
      action: "Bundle with slower-moving products"
    });
  }
  return { generatedAt: new Date().toISOString(), recommendations };
}

function totalSince(orders, date) {
  return orders.filter((order) => new Date(order.orderedAt) >= date).reduce((sum, order) => sum + order.total, 0);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function rangeStart(now, range) {
  const map = {
    today: startOfDay(now),
    yesterday: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    last7: new Date(now.getTime() - 7 * 86400000),
    last30: new Date(now.getTime() - 30 * 86400000),
    thisMonth: new Date(now.getFullYear(), now.getMonth(), 1),
    lastMonth: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    thisQuarter: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
    thisYear: new Date(now.getFullYear(), 0, 1)
  };
  return map[range] || map.last30;
}

function aggregateLines(lines, key, value) {
  return lines.reduce((acc, line) => {
    acc[line[key]] = (acc[line[key]] || 0) + value(line);
    return acc;
  }, {});
}

function monthly(items, dateKey, valueKey) {
  const rows = {};
  for (const item of items) {
    const key = item[dateKey].slice(0, 7);
    rows[key] = (rows[key] || 0) + item[valueKey];
  }
  return Object.entries(rows).map(([label, value]) => ({ label, value }));
}

function profitTrend(db) {
  return db.salesOrders.map((order) => ({
    label: order.orderedAt.slice(5, 10),
    value: order.total - order.lines.reduce((sum, line) => sum + line.unitCost * line.quantity, 0)
  }));
}

function monthlySalesVsPurchases(db) {
  const sales = monthly(db.salesOrders, "orderedAt", "total");
  const purchases = monthly(db.purchaseOrders, "orderedAt", "total");
  const labels = [...new Set([...sales, ...purchases].map((item) => item.label))];
  return labels.map((label) => ({
    label,
    sales: sales.find((item) => item.label === label)?.value || 0,
    purchases: purchases.find((item) => item.label === label)?.value || 0
  }));
}

function salesByCategory(db) {
  const totals = {};
  for (const order of db.salesOrders) {
    for (const line of order.lines) {
      const product = db.products.find((item) => item.id === line.productId);
      if (!product) continue;
      totals[product.category] = (totals[product.category] || 0) + line.quantity * line.unitPrice;
    }
  }
  return Object.entries(totals).map(([label, value]) => ({ label, value }));
}

function salesByChannel(db) {
  const totals = {};
  for (const order of db.salesOrders) {
    const channel = db.channels.find((item) => item.id === order.channelId);
    if (!channel) continue;
    totals[channel.name] = (totals[channel.name] || 0) + order.total;
  }
  return Object.entries(totals).map(([label, value]) => ({ label, value }));
}
