import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { authenticate, requirePermission, sanitizeUser, hashPassword, comparePassword, generateToken } from "./auth.js";
import { audit } from "./audit.js";
import { connectDatabase, readDomainDb } from "./db.js";
import { copilotInsights, dashboard } from "./domain.js";
import {
  validate,
  loginSchema,
  registerSchema,
  productSchema,
  customerSchema,
  supplierSchema,
  inventoryAdjustmentSchema,
  salesOrderSchema,
  purchaseOrderSchema,
  returnOrderSchema,
  paymentSchema,
  expenseSchema,
  userCreateSchema,
  roleCreateSchema
} from "./validation.js";

import {
  AuditLog,
  Category,
  Channel,
  Customer,
  Expense,
  Invoice,
  Notification,
  Payment,
  Product,
  PurchaseOrder,
  ReturnOrder,
  Role,
  SalesOrder,
  StockMovement,
  Supplier,
  User,
  collections
} from "./models.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const clientDist = join(root, "client", "dist");
const app = express();
const port = Number(process.env.PORT || 8123);
const host = process.env.HOST || "127.0.0.1";

// Request correlation ID
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

// Security headers & CORS
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://127.0.0.1:5173",
  credentials: true
}));

// Global Rate Limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", message: "Too many requests from this IP, please try again later." }
});
app.use("/api/", apiLimiter);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

/**
 * Mongoose Session Transaction Execution Helper with Standalone Fallback
 */
async function executeTransaction(callback) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    if (error.message?.includes("replica set") || error.message?.includes("Transaction numbers")) {
      return await callback(null);
    }
    throw error;
  } finally {
    session.endSession();
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "retail-platform", database: "mongodb", time: new Date().toISOString() });
});

// ---------------------------------------------------------
// AUTHENTICATION ROUTES (JWT & Bcrypt)
// ---------------------------------------------------------
app.post("/api/auth/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean();
  if (!user || !user.passwordHash || !comparePassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Invalid email or password" });
  }
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.json({ token, user: sanitizeUser(user) });
});

app.post("/api/auth/register", validate(registerSchema), async (req, res) => {
  const { name, email, password, role = "SALES_STAFF" } = req.body;
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return res.status(400).json({ error: "EMAIL_EXISTS", message: "User with this email already exists" });
  }
  const passwordHash = hashPassword(password);
  const userId = `usr_${randomUUID().slice(0, 8)}`;
  const newUser = await User.create({ id: userId, name, email, role, passwordHash });
  const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
  res.status(201).json({ token, user: sanitizeUser(newUser.toObject()) });
});

app.get("/api/me", authenticate, requirePermission("dashboard:read"), async (req, res) => {
  const role = await Role.findOne({ name: req.user.role }).lean();
  res.json({ user: sanitizeUser(req.user), permissions: role?.permissions || [] });
});

// ---------------------------------------------------------
// DASHBOARD & COPILOT INSIGHTS
// ---------------------------------------------------------
app.get("/api/dashboard", authenticate, requirePermission("dashboard:read"), async (req, res) => {
  res.json(dashboard(await readDomainDb(), req.query.range || "last30"));
});

app.get("/api/copilot/insights", authenticate, requirePermission("copilot:read"), async (req, res) => {
  res.json(copilotInsights(await readDomainDb()));
});

app.post("/api/copilot/chat", authenticate, requirePermission("copilot:read"), async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "QUERY_REQUIRED" });

  const db = await readDomainDb();
  const dash = dashboard(db, "thisMonth");

  const lowStockSummary = db.products
    .filter(p => (p.currentStock || 0) <= (p.minimumStockLevel || 10))
    .map(p => `${p.name} (Stock: ${p.currentStock}, Min: ${p.minimumStockLevel}, Cost: ₹${p.purchasePrice}, Sell: ₹${p.sellingPrice})`)
    .join("; ");

  const topDebtors = db.customers
    .slice()
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 5)
    .map(c => `${c.name}: ₹${c.outstanding}`)
    .join("; ");

  const topPayables = db.suppliers
    .slice()
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 5)
    .map(s => `${s.name}: ₹${s.outstanding}`)
    .join("; ");

  const topProducts = (dash.topProducts || [])
    .map(p => `${p.product} (${p.quantity} sold)`)
    .join(", ");

  const businessContext = `
Live Retail Database Snapshot:
- KPIs: Month Sales: ₹${dash.kpis?.monthSales || 0}, Today's Sales: ₹${dash.kpis?.todaysSales || 0}, Gross Profit: ₹${dash.kpis?.grossProfit || 0}, Net Profit: ₹${dash.kpis?.netProfit || 0}, Inventory Value: ₹${dash.kpis?.inventoryValue || 0}.
- Low Stock Items: ${lowStockSummary || "None"}
- Top Selling Items: ${topProducts || "N/A"}
- Customer Receivables: ${topDebtors || "None"}
- Supplier Payables: ${topPayables || "None"}
`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const candidateModels = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.5-flash"];
    for (const modelName of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const promptText = `You are the RetailOps AI Business Copilot, a sharp, executive-level retail analyst.
Use this live business context to answer the user's question directly, concisely, and accurately in 2-4 sentences with exact numbers (₹ INR), product names, and concrete recommendations.

${businessContext}

User Query: ${query}`;

        const apiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiText) {
            return res.json({ answer: aiText.trim(), model: modelName, source: "gemini" });
          }
        }
      } catch (err) {
        console.warn(`Gemini model ${modelName} failed:`, err.message);
      }
    }
  }

  let fallbackAnswer = `Based on live DB analysis: Month Sales are ₹${dash.kpis?.monthSales || 0} with Net Profit of ₹${dash.kpis?.netProfit || 0}. Inventory value stands at ₹${dash.kpis?.inventoryValue || 0}.`;
  let action = null;
  const q = query.toLowerCase();
  if (q.includes("reorder") || q.includes("stock") || q.includes("po")) {
    fallbackAnswer = `Urgent reorder items: ${lowStockSummary || "All items are currently above reorder thresholds."}`;
    action = { type: "DRAFT_PO", label: "⚡ Issue Supplier Purchase Order Now", targetView: "orders" };
  } else if (q.includes("outstanding") || q.includes("customer") || q.includes("debt")) {
    fallbackAnswer = `Top customer receivables: ${topDebtors || "Zero customer outstanding."}`;
    action = { type: "VIEW_DEBTORS", label: "⚡ View Customer Receivables & Credit Limits", targetView: "customers" };
  } else if (q.includes("return") || q.includes("rma") || q.includes("refund")) {
    fallbackAnswer = `Customer Returns Ledger: Process RMA refunds & restock stock.`;
    action = { type: "VIEW_RETURNS", label: "⚡ Open Customer Returns & RMA Ledger", targetView: "returns" };
  } else if (q.includes("profit") || q.includes("margin") || q.includes("sale")) {
    fallbackAnswer = `Month Sales: ₹${dash.kpis?.monthSales || 0}, Gross Profit: ₹${dash.kpis?.grossProfit || 0}, Net Profit: ₹${dash.kpis?.netProfit || 0}. Top selling: ${topProducts}.`;
    action = { type: "VIEW_FINANCE", label: "⚡ Inspect Financial Operating P&L", targetView: "finance" };
  }
  return res.json({ answer: fallbackAnswer, action, model: "rules-fallback", source: "database" });
});

// ---------------------------------------------------------
// CUSTOMER MASTER MANAGEMENT CRUD
// ---------------------------------------------------------
app.post("/api/customers", authenticate, requirePermission("partners:manage"), validate(customerSchema), async (req, res) => {
  const { name, businessName, email, phone, gstin, creditLimit, address } = req.body;
  const customerId = `cust_${randomUUID().slice(0, 8)}`;

  const customer = await Customer.create({
    id: customerId,
    name,
    businessName: businessName || "",
    email: email || "",
    phone: phone || "",
    gstin: gstin || "",
    creditLimit: creditLimit !== undefined ? creditLimit : 50000,
    outstanding: 0,
    address: address || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  await audit(req.user, "CUSTOMER_CREATED", "Customer", customer.id, customer.toObject());
  res.status(201).json(customer.toObject());
});

app.put("/api/customers/:id", authenticate, requirePermission("partners:manage"), async (req, res) => {
  const customer = await Customer.findOne({ id: req.params.id });
  if (!customer) return res.status(404).json({ error: "CUSTOMER_NOT_FOUND" });

  const allowed = ["name", "businessName", "email", "phone", "gstin", "creditLimit", "address"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) customer[key] = req.body[key];
  }
  customer.updatedAt = new Date().toISOString();
  await customer.save();
  await audit(req.user, "CUSTOMER_UPDATED", "Customer", customer.id, customer.toObject());
  res.json(customer.toObject());
});

app.delete("/api/customers/:id", authenticate, requirePermission("partners:manage"), async (req, res) => {
  const customer = await Customer.findOne({ id: req.params.id });
  if (!customer) return res.status(404).json({ error: "CUSTOMER_NOT_FOUND" });
  if ((customer.outstanding || 0) > 0) {
    return res.status(400).json({ error: "CANNOT_DELETE_CUSTOMER_WITH_OUTSTANDING", message: `Customer has outstanding receivables balance of ₹${customer.outstanding}` });
  }

  await Customer.deleteOne({ id: req.params.id });
  await audit(req.user, "CUSTOMER_DELETED", "Customer", req.params.id, { id: req.params.id, name: customer.name });
  res.json({ ok: true, id: req.params.id });
});

// ---------------------------------------------------------
// SUPPLIER MASTER MANAGEMENT CRUD
// ---------------------------------------------------------
app.post("/api/suppliers", authenticate, requirePermission("partners:manage"), validate(supplierSchema), async (req, res) => {
  const { name, companyName, contact, email, gstin, paymentTerms, address } = req.body;
  const supplierId = `sup_${randomUUID().slice(0, 8)}`;

  const supplier = await Supplier.create({
    id: supplierId,
    name,
    companyName: companyName || name,
    contact: contact || "",
    email: email || "",
    gstin: gstin || "",
    paymentTerms: paymentTerms || "Net 30",
    outstanding: 0,
    address: address || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  await audit(req.user, "SUPPLIER_CREATED", "Supplier", supplier.id, supplier.toObject());
  res.status(201).json(supplier.toObject());
});

app.put("/api/suppliers/:id", authenticate, requirePermission("partners:manage"), async (req, res) => {
  const supplier = await Supplier.findOne({ id: req.params.id });
  if (!supplier) return res.status(404).json({ error: "SUPPLIER_NOT_FOUND" });

  const allowed = ["name", "companyName", "contact", "email", "gstin", "paymentTerms", "address"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) supplier[key] = req.body[key];
  }
  supplier.updatedAt = new Date().toISOString();
  await supplier.save();
  await audit(req.user, "SUPPLIER_UPDATED", "Supplier", supplier.id, supplier.toObject());
  res.json(supplier.toObject());
});

app.delete("/api/suppliers/:id", authenticate, requirePermission("partners:manage"), async (req, res) => {
  const supplier = await Supplier.findOne({ id: req.params.id });
  if (!supplier) return res.status(404).json({ error: "SUPPLIER_NOT_FOUND" });
  if ((supplier.outstanding || 0) > 0) {
    return res.status(400).json({ error: "CANNOT_DELETE_SUPPLIER_WITH_OUTSTANDING", message: `Supplier has outstanding payables balance of ₹${supplier.outstanding}` });
  }

  await Supplier.deleteOne({ id: req.params.id });
  await audit(req.user, "SUPPLIER_DELETED", "Supplier", req.params.id, { id: req.params.id, name: supplier.name });
  res.json({ ok: true, id: req.params.id });
});

// ---------------------------------------------------------
// PRODUCT MANAGEMENT
// ---------------------------------------------------------
app.post("/api/products", authenticate, requirePermission("catalog:manage"), validate(productSchema), async (req, res) => {
  const { name, sku, purchasePrice, sellingPrice, category, brand, supplierId, unit, tax, minimumStockLevel, currentStock, barcode, description, batchNumber, expiryDate } = req.body;

  const product = await Product.create({
    id: `prd_${randomUUID()}`,
    sku,
    barcode: barcode || "",
    name,
    description: description || `${name} retail pack`,
    category: category || "General",
    brand: brand || "",
    supplierId: supplierId || "",
    unit: unit || "PCS",
    purchasePrice,
    sellingPrice,
    tax,
    discount: 0,
    minimumStockLevel,
    currentStock,
    batchNumber: batchNumber || "",
    expiryDate: expiryDate || "",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  if (currentStock > 0) {
    await StockMovement.create({
      id: `mov_${randomUUID()}`,
      productId: product.id,
      type: "OPENING_STOCK",
      quantity: currentStock,
      batchNumber: batchNumber || "",
      expiryDate: expiryDate || "",
      createdAt: new Date().toISOString()
    });
  }

  await audit(req.user, "PRODUCT_CREATED", "Product", product.id, product.toObject());
  res.status(201).json(product.toObject());
});

app.put("/api/products/:id", authenticate, requirePermission("catalog:manage"), async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });
  if (!product) return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });

  const allowedUpdates = ["name", "sku", "barcode", "category", "brand", "supplierId", "unit", "purchasePrice", "sellingPrice", "tax", "minimumStockLevel", "currentStock", "status", "description", "batchNumber", "expiryDate"];
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      if (["purchasePrice", "sellingPrice", "tax", "minimumStockLevel", "currentStock"].includes(key)) {
        product[key] = Number(req.body[key]);
      } else {
        product[key] = req.body[key];
      }
    }
  }

  product.updatedAt = new Date().toISOString();
  await product.save();
  await audit(req.user, "PRODUCT_UPDATED", "Product", product.id, product.toObject());
  res.json(product.toObject());
});

app.delete("/api/products/:id", authenticate, requirePermission("catalog:manage"), async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });
  if (!product) return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });

  await Product.deleteOne({ id: req.params.id });
  await audit(req.user, "PRODUCT_DELETED", "Product", req.params.id, { id: req.params.id, name: product.name });
  res.json({ ok: true, id: req.params.id });
});

// ---------------------------------------------------------
// PURCHASE ORDER LIFECYCLE
// ---------------------------------------------------------
app.post("/api/purchase-orders", authenticate, requirePermission("orders:manage"), validate(purchaseOrderSchema), async (req, res) => {
  const { supplierId, items, notes, expectedDeliveryDate } = req.body;

  const supplier = await Supplier.findOne({ id: supplierId });
  if (!supplier) return res.status(404).json({ error: "SUPPLIER_NOT_FOUND" });

  let subtotal = 0;
  let taxTotal = 0;
  const enrichedLines = [];

  for (const item of items) {
    const product = await Product.findOne({ id: item.productId });
    if (!product) return res.status(404).json({ error: `PRODUCT_NOT_FOUND: ${item.productId}` });
    const qty = Number(item.quantity || 1);
    const unitPrice = Number(item.unitPrice || product.purchasePrice || 0);
    const tax = Number(item.tax !== undefined ? item.tax : product.tax || 0);

    const lineSubtotal = qty * unitPrice;
    const lineTax = lineSubtotal * (tax / 100);
    subtotal += lineSubtotal;
    taxTotal += lineTax;

    enrichedLines.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: qty,
      unitPrice,
      tax,
      lineTotal: Math.round(lineSubtotal + lineTax)
    });
  }

  const grandTotal = Math.round(subtotal + taxTotal);
  const poId = `po_${Date.now()}`;

  const po = await PurchaseOrder.create({
    id: poId,
    supplierId,
    supplierName: supplier.name || supplier.companyName || "Supplier",
    status: "ORDERED",
    orderedAt: new Date().toISOString(),
    expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 7 * 86400000).toISOString(),
    lines: enrichedLines,
    subtotal: Math.round(subtotal),
    tax: Math.round(taxTotal),
    total: grandTotal,
    notes: notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  await audit(req.user, "PO_CREATED", "PurchaseOrder", po.id, po.toObject());
  res.status(201).json(po.toObject());
});

app.post("/api/purchase-orders/:id/receive", authenticate, requirePermission("purchases:receive"), async (req, res) => {
  const po = await PurchaseOrder.findOne({ id: req.params.id });
  if (!po) return res.status(404).json({ error: "PO_NOT_FOUND" });
  if (po.status === "RECEIVED") return res.status(400).json({ error: "PO_ALREADY_RECEIVED" });

  const updatedPo = await executeTransaction(async (session) => {
    const opts = session ? { session } : {};

    for (const line of po.lines || []) {
      const product = await Product.findOne({ id: line.productId }, null, opts);
      if (product) {
        product.currentStock = Number(product.currentStock || 0) + Number(line.quantity);
        product.updatedAt = new Date().toISOString();
        await product.save(opts);

        await StockMovement.create([{
          id: `mov_${randomUUID()}`,
          productId: product.id,
          type: "PURCHASE_RECEIPT",
          quantity: Number(line.quantity),
          referenceDocId: po.id,
          createdAt: new Date().toISOString()
        }], opts);
      }
    }

    const supplier = await Supplier.findOne({ id: po.supplierId }, null, opts);
    if (supplier) {
      supplier.outstanding = Number(supplier.outstanding || 0) + Number(po.total || 0);
      supplier.updatedAt = new Date().toISOString();
      await supplier.save(opts);
    }

    po.status = "RECEIVED";
    po.receivedAt = new Date().toISOString();
    po.updatedAt = new Date().toISOString();
    await po.save(opts);

    return po;
  });

  await audit(req.user, "PO_RECEIVED", "PurchaseOrder", po.id, { total: po.total });
  res.json({ ok: true, po: updatedPo.toObject() });
});

// ---------------------------------------------------------
// SALES ORDER LIFECYCLE (Credit Limit Check & Anti-Overselling)
// ---------------------------------------------------------
app.post("/api/sales-orders", authenticate, requirePermission("sales:create"), validate(salesOrderSchema), async (req, res) => {
  const { customerId, channelId, items, notes } = req.body;

  const customer = await Customer.findOne({ id: customerId });
  if (!customer) return res.status(404).json({ error: "CUSTOMER_NOT_FOUND" });

  // 1. Anti-Overselling Stock Check
  let estimatedTotal = 0;
  for (const item of items) {
    const product = await Product.findOne({ id: item.productId });
    if (!product) return res.status(404).json({ error: `PRODUCT_NOT_FOUND: ${item.productId}` });
    const requestedQty = Number(item.quantity);
    const availableStock = Number(product.currentStock || 0);

    if (availableStock < requestedQty) {
      return res.status(422).json({
        error: "INSUFFICIENT_STOCK",
        message: `Insufficient stock for '${product.name}' (${product.sku}). In stock: ${availableStock}, Requested: ${requestedQty}`,
        productId: product.id,
        availableStock,
        requestedQty
      });
    }

    const sellingPrice = Number(item.unitPrice || product.sellingPrice || 0);
    const tax = Number(item.tax !== undefined ? item.tax : product.tax || 0);
    const lineSub = requestedQty * sellingPrice;
    const lineTax = lineSub * (tax / 100);
    estimatedTotal += lineSub + lineTax;
  }

  // 2. Customer Credit Limit Safeguard Check
  const currentOutstanding = Number(customer.outstanding || 0);
  const creditLimit = Number(customer.creditLimit !== undefined ? customer.creditLimit : 50000);
  if (currentOutstanding + estimatedTotal > creditLimit) {
    return res.status(422).json({
      error: "CREDIT_LIMIT_EXCEEDED",
      message: `Order total (₹${Math.round(estimatedTotal)}) + current outstanding balance (₹${currentOutstanding}) exceeds customer credit limit (₹${creditLimit}).`,
      currentOutstanding,
      creditLimit,
      orderTotal: Math.round(estimatedTotal)
    });
  }

  // 3. Transactional Execution
  const result = await executeTransaction(async (session) => {
    const opts = session ? { session } : {};
    let subtotal = 0;
    let taxTotal = 0;
    const enrichedLines = [];

    for (const item of items) {
      const product = await Product.findOne({ id: item.productId }, null, opts);
      const qty = Number(item.quantity);
      const sellingPrice = Number(item.unitPrice || product.sellingPrice || 0);
      const costPrice = Number(product.purchasePrice || 0);
      const tax = Number(item.tax !== undefined ? item.tax : product.tax || 0);

      product.currentStock = Number(product.currentStock) - qty;
      product.updatedAt = new Date().toISOString();
      await product.save(opts);

      await StockMovement.create([{
        id: `mov_${randomUUID()}`,
        productId: product.id,
        type: "SALE",
        quantity: -qty,
        createdAt: new Date().toISOString()
      }], opts);

      const lineSubtotal = qty * sellingPrice;
      const lineTax = lineSubtotal * (tax / 100);
      subtotal += lineSubtotal;
      taxTotal += lineTax;

      enrichedLines.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: qty,
        unitPrice: sellingPrice,
        unitCost: costPrice,
        tax,
        lineTotal: Math.round(lineSubtotal + lineTax)
      });
    }

    const grandTotal = Math.round(subtotal + taxTotal);
    const soId = `so_${Date.now()}`;
    const invId = `inv_${Date.now()}`;

    const [salesOrder] = await SalesOrder.create([{
      id: soId,
      customerId,
      customerName: customer.name,
      channelId: channelId || "chn_direct",
      status: "CONFIRMED",
      orderedAt: new Date().toISOString(),
      lines: enrichedLines,
      subtotal: Math.round(subtotal),
      tax: Math.round(taxTotal),
      total: grandTotal,
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }], opts);

    const [invoice] = await Invoice.create([{
      id: invId,
      salesOrderId: salesOrder.id,
      customerId,
      customerName: customer.name,
      status: "UNPAID",
      issuedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 15 * 86400000).toISOString(),
      subtotal: Math.round(subtotal),
      tax: Math.round(taxTotal),
      total: grandTotal,
      paid: 0,
      lines: enrichedLines,
      createdAt: new Date().toISOString()
    }], opts);

    customer.outstanding = Number(customer.outstanding || 0) + grandTotal;
    customer.updatedAt = new Date().toISOString();
    await customer.save(opts);

    return { salesOrder, invoice };
  });

  await audit(req.user, "SALE_CREATED", "SalesOrder", result.salesOrder.id, { total: result.salesOrder.total, invoiceId: result.invoice.id });
  res.status(201).json({ salesOrder: result.salesOrder.toObject(), invoice: result.invoice.toObject() });
});

// ---------------------------------------------------------
// CUSTOMER RETURNS & RMA WORKFLOW (Restock vs Scrap & Refund)
// ---------------------------------------------------------
app.post("/api/returns", authenticate, requirePermission("returns:manage"), validate(returnOrderSchema), async (req, res) => {
  const { salesOrderId, customerId, productId, quantity, reason, action, refundAmount, notes } = req.body;

  const customer = await Customer.findOne({ id: customerId });
  if (!customer) return res.status(404).json({ error: "CUSTOMER_NOT_FOUND" });

  const product = await Product.findOne({ id: productId });
  if (!product) return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });

  const returnRecord = await executeTransaction(async (session) => {
    const opts = session ? { session } : {};
    const returnId = `ret_${Date.now()}`;

    // 1. Inventory Stock Adjustment (Restock vs Scrap)
    if (action === "RESTOCK") {
      product.currentStock = Number(product.currentStock || 0) + quantity;
      product.updatedAt = new Date().toISOString();
      await product.save(opts);

      await StockMovement.create([{
        id: `mov_${randomUUID()}`,
        productId: product.id,
        type: "CUSTOMER_RETURN",
        quantity,
        referenceDocId: returnId,
        createdAt: new Date().toISOString()
      }], opts);
    } else {
      await StockMovement.create([{
        id: `mov_${randomUUID()}`,
        productId: product.id,
        type: "DAMAGED_SCRAP",
        quantity: -quantity,
        referenceDocId: returnId,
        createdAt: new Date().toISOString()
      }], opts);
    }

    // 2. Customer Receivables Refund Adjustment
    customer.outstanding = Math.max(0, Number(customer.outstanding || 0) - refundAmount);
    customer.updatedAt = new Date().toISOString();
    await customer.save(opts);

    // 3. Create Return Order Record
    const [retDoc] = await ReturnOrder.create([{
      id: returnId,
      salesOrderId,
      customerId,
      customerName: customer.name,
      productId: product.id,
      productName: product.name,
      quantity,
      reason,
      action,
      refundAmount,
      notes: notes || "",
      status: "COMPLETED",
      returnedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }], opts);

    return retDoc;
  });

  await audit(req.user, "RETURN_PROCESSED", "ReturnOrder", returnRecord.id, { action, refundAmount });
  res.status(201).json(returnRecord.toObject());
});

// ---------------------------------------------------------
// PAYMENT RECONCILIATION & DISBURSEMENTS
// ---------------------------------------------------------
app.post("/api/payments", authenticate, requirePermission("payments:manage"), validate(paymentSchema), async (req, res) => {
  const { type, customerId, supplierId, invoiceId, amount, method, notes } = req.body;

  const paymentRecord = await executeTransaction(async (session) => {
    const opts = session ? { session } : {};
    const payId = `pay_${Date.now()}`;

    if (type === "CUSTOMER_RECEIPT") {
      if (!customerId) throw new Error("CUSTOMER_REQUIRED");
      const customer = await Customer.findOne({ id: customerId }, null, opts);
      if (!customer) throw new Error("CUSTOMER_NOT_FOUND");

      customer.outstanding = Math.max(0, Number(customer.outstanding || 0) - amount);
      customer.updatedAt = new Date().toISOString();
      await customer.save(opts);

      if (invoiceId) {
        const invoice = await Invoice.findOne({ id: invoiceId }, null, opts);
        if (invoice) {
          invoice.paid = Number(invoice.paid || 0) + amount;
          invoice.status = invoice.paid >= invoice.total ? "PAID" : "PARTIAL";
          await invoice.save(opts);
        }
      }

      const [rec] = await Payment.create([{
        id: payId,
        type: "CUSTOMER_RECEIPT",
        customerId,
        customerName: customer.name,
        invoiceId: invoiceId || "",
        amount,
        method: method || "UPI",
        paidAt: new Date().toISOString(),
        notes: notes || "Customer payment receipt",
        createdAt: new Date().toISOString()
      }], opts);

      return rec;
    } else {
      if (!supplierId) throw new Error("SUPPLIER_REQUIRED");
      const supplier = await Supplier.findOne({ id: supplierId }, null, opts);
      if (!supplier) throw new Error("SUPPLIER_NOT_FOUND");

      supplier.outstanding = Math.max(0, Number(supplier.outstanding || 0) - amount);
      supplier.updatedAt = new Date().toISOString();
      await supplier.save(opts);

      const [rec] = await Payment.create([{
        id: payId,
        type: "SUPPLIER_PAYMENT",
        supplierId,
        supplierName: supplier.name || supplier.companyName,
        amount,
        method: method || "BANK",
        paidAt: new Date().toISOString(),
        notes: notes || "Supplier disbursement payment",
        createdAt: new Date().toISOString()
      }], opts);

      return rec;
    }
  });

  await audit(req.user, paymentRecord.type === "CUSTOMER_RECEIPT" ? "PAYMENT_RECEIVED" : "PAYMENT_DISBURSED", "Payment", paymentRecord.id, { amount });
  res.status(201).json(paymentRecord.toObject());
});

// ---------------------------------------------------------
// OPERATING EXPENSES
// ---------------------------------------------------------
app.post("/api/expenses", authenticate, requirePermission("financials:read"), validate(expenseSchema), async (req, res) => {
  const { category, amount, notes, method } = req.body;

  const expId = `exp_${Date.now()}`;
  const expense = await Expense.create({
    id: expId,
    category,
    amount,
    spentAt: new Date().toISOString(),
    method: method || "UPI",
    notes: notes || "",
    createdAt: new Date().toISOString()
  });

  await audit(req.user, "EXPENSE_LOGGED", "Expense", expense.id, { category: expense.category, amount });
  res.status(201).json(expense.toObject());
});

// Generic Read-Only Registrations
registerListRoute("/api/products", "products", "catalog:read");
registerListRoute("/api/categories", "categories", "catalog:read");
registerListRoute("/api/suppliers", "suppliers", "partners:manage");
registerListRoute("/api/customers", "customers", "customers:read");
registerListRoute("/api/channels", "channels", "dashboard:read");
registerListRoute("/api/inventory/movements", "stockMovements", "inventory:read");
registerListRoute("/api/purchase-orders", "purchaseOrders", "reports:read");
registerListRoute("/api/sales-orders", "salesOrders", "reports:read");
registerListRoute("/api/invoices", "invoices", "invoices:read");
registerListRoute("/api/payments", "payments", "payments:manage");
registerListRoute("/api/expenses", "expenses", "financials:read");
registerListRoute("/api/returns", "returns", "returns:manage");
registerListRoute("/api/notifications", "notifications", "dashboard:read");
registerListRoute("/api/audit-logs", "auditLogs", "audit:read");

// ---------------------------------------------------------
// USER & ROLE MANAGEMENT
// ---------------------------------------------------------
app.get("/api/users", authenticate, requirePermission("users:manage"), async (req, res) => {
  const users = await User.find().lean();
  res.json({ data: users.map(sanitizeUser), count: users.length });
});

app.get("/api/roles", authenticate, async (req, res) => {
  const roles = await Role.find().lean();
  res.json({ data: roles, count: roles.length });
});

app.post("/api/roles", authenticate, requirePermission("roles:manage"), validate(roleCreateSchema), async (req, res) => {
  const { name, description, permissions } = req.body;

  const roleId = `role_${randomUUID()}`;
  const role = await Role.create({
    id: roleId,
    name,
    description: description || `Custom dynamic role: ${name}`,
    permissions,
    isSystemRole: false
  });

  await audit(req.user, "ROLE_CREATED", "Role", role.id, role.toObject());
  res.status(201).json(role.toObject());
});

app.put("/api/roles/:id", authenticate, requirePermission("roles:manage"), async (req, res) => {
  const role = await Role.findOne({ $or: [{ id: req.params.id }, { name: req.params.id }] });
  if (!role) return res.status(404).json({ error: "ROLE_NOT_FOUND" });

  if (req.body.permissions && Array.isArray(req.body.permissions)) {
    role.permissions = req.body.permissions;
  }
  if (req.body.name && !role.isSystemRole) {
    role.name = req.body.name;
  }
  if (req.body.description) {
    role.description = req.body.description;
  }

  await role.save();
  await audit(req.user, "ROLE_UPDATED", "Role", role.id, role.toObject());
  res.json(role.toObject());
});

app.delete("/api/roles/:id", authenticate, requirePermission("roles:manage"), async (req, res) => {
  const role = await Role.findOne({ $or: [{ id: req.params.id }, { name: req.params.id }] });
  if (!role) return res.status(404).json({ error: "ROLE_NOT_FOUND" });
  if (role.isSystemRole) return res.status(400).json({ error: "CANNOT_DELETE_SYSTEM_ROLE" });

  await Role.deleteOne({ _id: role._id });
  await audit(req.user, "ROLE_DELETED", "Role", role.id, { id: role.id, name: role.name });
  res.json({ ok: true, id: role.id });
});

app.post("/api/users", authenticate, requirePermission("users:manage"), validate(userCreateSchema), async (req, res) => {
  const { name, email, role, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: "USER_EMAIL_ALREADY_EXISTS" });
  }

  const roleDoc = await Role.findOne({ $or: [{ id: role }, { name: role }] });
  if (!roleDoc) {
    return res.status(404).json({ error: "ROLE_NOT_FOUND" });
  }

  const userId = `usr_${randomUUID()}`;
  const userToken = `token_${randomUUID().slice(0, 8)}`;
  const passwordHash = hashPassword(password || "Password123!");

  const newUser = await User.create({
    id: userId,
    name,
    email,
    role: roleDoc.id,
    token: userToken,
    passwordHash
  });

  await audit(req.user, "USER_CREATED", "User", newUser.id, { id: newUser.id, name: newUser.name, role: roleDoc.id });
  res.status(201).json(sanitizeUser(newUser.toObject()));
});

app.delete("/api/users/:id", authenticate, requirePermission("users:manage"), async (req, res) => {
  const user = await User.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
  if (user.role === "SUPER_ADMIN" || user.id === req.user.id) {
    return res.status(400).json({ error: "CANNOT_DELETE_THIS_USER" });
  }

  await User.deleteOne({ _id: user._id });
  await audit(req.user, "USER_DELETED", "User", user.id, { id: user.id, name: user.name });
  res.json({ ok: true, id: user.id });
});

app.put("/api/users/:id/role", authenticate, requirePermission("users:manage"), async (req, res) => {
  const { roleId } = req.body;
  const user = await User.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

  const role = await Role.findOne({ $or: [{ id: roleId }, { name: roleId }] });
  if (!role) return res.status(404).json({ error: "ROLE_NOT_FOUND" });

  user.role = role.id;
  await user.save();
  await audit(req.user, "USER_ROLE_ASSIGNED", "User", user.id, { userId: user.id, roleId: role.id });
  res.json({ ok: true, user: sanitizeUser(user.toObject()) });
});

app.post("/api/inventory/adjustments", authenticate, requirePermission("inventory:manage"), validate(inventoryAdjustmentSchema), async (req, res) => {
  const { productId, quantity, type, batchNumber, expiryDate } = req.body;

  const result = await executeTransaction(async (session) => {
    const opts = session ? { session } : {};

    const product = await Product.findOne({ id: productId }, null, opts);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    product.currentStock = Number(product.currentStock || 0) + quantity;
    if (batchNumber) product.batchNumber = batchNumber;
    if (expiryDate) product.expiryDate = expiryDate;
    product.updatedAt = new Date().toISOString();
    await product.save(opts);

    const [movement] = await StockMovement.create([{
      id: `mov_${randomUUID()}`,
      productId: product.id,
      type: type || "MANUAL_ADJUSTMENT",
      quantity,
      batchNumber: batchNumber || "",
      expiryDate: expiryDate || "",
      createdAt: new Date().toISOString()
    }], opts);

    return { product, movement };
  });

  await audit(req.user, "INVENTORY_ADJUSTED", "Product", result.product.id, { quantity });
  res.status(201).json({ product: result.product.toObject(), movement: result.movement.toObject() });
});

// Static client build serving
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => res.sendFile(join(clientDist, "index.html")));
}

// 404 & Error handlers
app.use((req, res) => {
  res.status(404).json({ error: "NOT_FOUND", requestId: req.requestId });
});

app.use((error, req, res, next) => {
  console.error({ requestId: req.requestId, error: error.message || error });
  res.status(500).json({ error: "INTERNAL_ERROR", message: error.message || "An unexpected error occurred", requestId: req.requestId });
});

function registerListRoute(path, key, permission) {
  app.get(path, authenticate, requirePermission(permission), async (req, res) => {
    const Model = collections[key];
    const rows = await Model.find().lean();
    const search = String(req.query.q || "").toLowerCase();
    const filtered = search ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search)) : rows;
    res.json({ data: filtered, count: filtered.length });
  });
}

connectDatabase()
  .then(() => {
    app.listen(port, host, () => {
      console.log(`Retail API running on http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });

export default app;
