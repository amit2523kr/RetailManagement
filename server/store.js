import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataPath = join(root, "data", "retail-db.json");

const roles = [
  { id: "SUPER_ADMIN", name: "Super Admin", description: "Unrestricted global platform access", permissions: ["*"], isSystemRole: true },
  { id: "BUSINESS_OWNER", name: "Business Owner", description: "Full operational & financial access", permissions: ["dashboard:read", "financials:read", "users:manage", "roles:manage", "catalog:manage", "partners:manage", "orders:manage", "inventory:manage", "payments:manage", "audit:read", "copilot:read"], isSystemRole: true },
  { id: "MANAGER", name: "Store Manager", description: "Catalog, orders, and inventory oversight", permissions: ["dashboard:read", "catalog:manage", "partners:manage", "orders:manage", "inventory:read", "reports:read"], isSystemRole: true },
  { id: "SALES_STAFF", name: "Sales Representative", description: "Point-of-sale and sales order creation", permissions: ["dashboard:read", "customers:read", "inventory:read", "sales:create", "invoices:create"], isSystemRole: true },
  { id: "INVENTORY_STAFF", name: "Warehouse Specialist", description: "Stock adjustments, goods receipt & returns", permissions: ["inventory:manage", "purchases:receive", "returns:manage", "catalog:read"], isSystemRole: true },
  { id: "ACCOUNTANT", name: "Financial Accountant", description: "Invoicing, payment reconciliation & expenses", permissions: ["payments:manage", "invoices:read", "financials:read", "reports:read"], isSystemRole: true }
];

const users = [
  { id: "usr_super", name: "Asha Rao", email: "asha@example.com", role: "SUPER_ADMIN", token: "super-token" },
  { id: "usr_owner", name: "Vikram Shah", email: "owner@example.com", role: "BUSINESS_OWNER", token: "owner-token" },
  { id: "usr_manager", name: "Mina Patel", email: "manager@example.com", role: "MANAGER", token: "manager-token" },
  { id: "usr_sales", name: "Kabir Khan", email: "sales@example.com", role: "SALES_STAFF", token: "sales-token" },
  { id: "usr_inventory", name: "Neha Singh", email: "inventory@example.com", role: "INVENTORY_STAFF", token: "inventory-token" },
  { id: "usr_accountant", name: "Rohan Mehta", email: "accountant@example.com", role: "ACCOUNTANT", token: "accountant-token" }
];

export async function loadDb() {
  if (!existsSync(dataPath)) {
    await saveDb(seedDb());
  }
  return JSON.parse(await readFile(dataPath, "utf8"));
}

export async function saveDb(db) {
  await mkdir(dirname(dataPath), { recursive: true });
  db.meta.updatedAt = new Date().toISOString();
  await writeFile(dataPath, JSON.stringify(db, null, 2));
}

export function seedDb() {
  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 86400000).toISOString();
  const categories = [
    { id: "cat_bev", name: "Beverages", status: "ACTIVE" },
    { id: "cat_snack", name: "Snacks", status: "ACTIVE" },
    { id: "cat_dairy", name: "Dairy", status: "ACTIVE" }
  ];
  const suppliers = [
    { id: "sup_coke", name: "Coca-Cola Agency", contact: "Nisha", outstanding: 25500 },
    { id: "sup_pepsi", name: "Pepsi Distributor", contact: "Harish", outstanding: 18100 },
    { id: "sup_nestle", name: "Nestle Foods", contact: "Divya", outstanding: 9400 }
  ];
  const customers = [
    { id: "cus_mart", name: "Bright Mart", channelId: "chn_direct", outstanding: 22400 },
    { id: "cus_hotel", name: "Hotel Sunrise", channelId: "chn_b2b", outstanding: 9800 },
    { id: "cus_market", name: "QuickBasket", channelId: "chn_market", outstanding: 15200 }
  ];
  const channels = [
    { id: "chn_direct", name: "Direct Store", feePercent: 0 },
    { id: "chn_b2b", name: "B2B Wholesale", feePercent: 1.5 },
    { id: "chn_market", name: "Marketplace", feePercent: 8 }
  ];
  const products = [
    product("prd_coke_500", "COKE-500", "8901764010018", "Coca-Cola 500ml", "Beverages", "Coca-Cola", "sup_coke", 23, 38, 18, 240, 60),
    product("prd_pepsi_500", "PEP-500", "8902080200208", "Pepsi 500ml", "Beverages", "Pepsi", "sup_pepsi", 22, 36, 18, 175, 50),
    product("prd_maggi", "NES-MAG-70", "8901058841114", "Maggi Masala 70g", "Snacks", "Nestle", "sup_nestle", 11, 15, 12, 420, 100),
    product("prd_milk", "AMUL-MILK-1L", "8901262010023", "Toned Milk 1L", "Dairy", "Amul", "sup_nestle", 52, 62, 5, 28, 40),
    product("prd_chips", "LAY-CLASSIC-52", "8901491102011", "Classic Salted Chips", "Snacks", "Lays", "sup_pepsi", 16, 25, 12, 12, 35)
  ];
  function product(id, sku, barcode, name, categoryName, brand, supplierId, purchasePrice, sellingPrice, tax, currentStock, minimumStockLevel) {
    const category = categories.find((item) => item.name === categoryName);
    return {
      id, sku, barcode, name,
      description: `${name} retail pack`,
      categoryId: category.id,
      category: category.name,
      brand,
      supplierId,
      unit: "PCS",
      purchasePrice,
      sellingPrice,
      tax,
      discount: 0,
      minimumStockLevel,
      currentStock,
      image: "",
      status: "ACTIVE",
      createdAt: daysAgo(90),
      updatedAt: daysAgo(2)
    };
  }
  const purchaseOrders = [
    { id: "po_1001", supplierId: "sup_coke", status: "RECEIVED", orderedAt: daysAgo(20), receivedAt: daysAgo(18), total: 46000 },
    { id: "po_1002", supplierId: "sup_pepsi", status: "PARTIAL", orderedAt: daysAgo(7), receivedAt: null, total: 32200 },
    { id: "po_1003", supplierId: "sup_nestle", status: "DRAFT", orderedAt: daysAgo(2), receivedAt: null, total: 12800 }
  ];
  const salesOrders = [
    sale("so_2001", "cus_mart", "chn_direct", daysAgo(28), [{ productId: "prd_coke_500", quantity: 80 }, { productId: "prd_maggi", quantity: 120 }]),
    sale("so_2002", "cus_hotel", "chn_b2b", daysAgo(14), [{ productId: "prd_pepsi_500", quantity: 90 }, { productId: "prd_milk", quantity: 30 }]),
    sale("so_2003", "cus_market", "chn_market", daysAgo(5), [{ productId: "prd_coke_500", quantity: 140 }, { productId: "prd_chips", quantity: 60 }]),
    sale("so_2004", "cus_mart", "chn_direct", daysAgo(1), [{ productId: "prd_maggi", quantity: 180 }, { productId: "prd_pepsi_500", quantity: 48 }])
  ];
  function sale(id, customerId, channelId, orderedAt, lines) {
    const enriched = lines.map((line) => {
      const p = products.find((item) => item.id === line.productId);
      return { ...line, unitPrice: p.sellingPrice, unitCost: p.purchasePrice, tax: p.tax };
    });
    const subtotal = enriched.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    const tax = enriched.reduce((sum, line) => sum + line.quantity * line.unitPrice * (line.tax / 100), 0);
    return { id, customerId, channelId, status: "INVOICED", orderedAt, lines: enriched, subtotal, tax, total: Math.round(subtotal + tax) };
  }
  const invoices = salesOrders.map((order, index) => ({
    id: `inv_${3001 + index}`,
    salesOrderId: order.id,
    customerId: order.customerId,
    status: index === 1 ? "PARTIAL" : "UNPAID",
    issuedAt: order.orderedAt,
    dueAt: daysAgo(index - 10),
    total: order.total,
    paid: index === 1 ? 2000 : 0
  }));
  const payments = [
    { id: "pay_4001", type: "CUSTOMER_RECEIPT", customerId: "cus_hotel", invoiceId: "inv_3002", amount: 2000, method: "UPI", paidAt: daysAgo(4) },
    { id: "pay_4002", type: "SUPPLIER_PAYMENT", supplierId: "sup_coke", amount: 12000, method: "BANK", paidAt: daysAgo(3) }
  ];
  return {
    meta: { createdAt: now.toISOString(), updatedAt: now.toISOString() },
    roles,
    users,
    categories,
    suppliers,
    customers,
    channels,
    products,
    purchaseOrders,
    salesOrders,
    invoices,
    payments,
    expenses: [
      { id: "exp_1", category: "Delivery", amount: 2800, spentAt: daysAgo(6), notes: "Local logistics" },
      { id: "exp_2", category: "Utilities", amount: 6100, spentAt: daysAgo(16), notes: "Warehouse power" }
    ],
    returns: [
      { id: "ret_1", salesOrderId: "so_2003", productId: "prd_chips", quantity: 4, reason: "Damaged on delivery", status: "CREDITED", createdAt: daysAgo(2) }
    ],
    stockMovements: [
      { id: "mov_1", productId: "prd_coke_500", type: "PURCHASE_RECEIPT", quantity: 320, createdAt: daysAgo(18) },
      { id: "mov_2", productId: "prd_pepsi_500", type: "SALE", quantity: -138, createdAt: daysAgo(5) },
      { id: "mov_3", productId: "prd_chips", type: "SALE", quantity: -60, createdAt: daysAgo(5) },
      { id: "mov_4", productId: "prd_chips", type: "RETURN", quantity: 4, createdAt: daysAgo(2) }
    ],
    notifications: [
      { id: "not_1", severity: "HIGH", title: "Milk below minimum stock", read: false, createdAt: daysAgo(1) },
      { id: "not_2", severity: "MEDIUM", title: "Pepsi PO partially received", read: false, createdAt: daysAgo(2) }
    ],
    auditLogs: [
      { id: "aud_1", actorId: "usr_owner", action: "SEED_DATA_CREATED", entity: "SYSTEM", entityId: "seed", createdAt: now.toISOString(), metadata: {} }
    ]
  };
}

export function findUserByToken(db, token) {
  return db.users.find((user) => user.token === token);
}

export function can(db, user, permission) {
  const grants = db.roles[user.role] || [];
  const impliedManage = permission.endsWith(":read") && grants.includes(permission.replace(":read", ":manage"));
  return grants.includes("*") || grants.includes(permission) || impliedManage;
}

export function audit(db, actor, action, entity, entityId, metadata = {}) {
  db.auditLogs.unshift({
    id: `aud_${randomUUID()}`,
    actorId: actor?.id || "system",
    action,
    entity,
    entityId,
    createdAt: new Date().toISOString(),
    metadata
  });
}
