import mongoose from "mongoose";

const loose = { strict: false, timestamps: false, versionKey: false };

const roleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  permissions: [{ type: String, required: true }],
  isSystemRole: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, required: true },
  token: { type: String },
  passwordHash: { type: String }
}, { timestamps: true, versionKey: false });

const entitySchema = new mongoose.Schema({
  id: { type: String, index: true }
}, loose);

export const Role = mongoose.model("Role", roleSchema);
export const User = mongoose.model("User", userSchema);
export const Category = mongoose.model("Category", entitySchema, "categories");
export const Supplier = mongoose.model("Supplier", entitySchema, "suppliers");
export const Customer = mongoose.model("Customer", entitySchema, "customers");
export const Channel = mongoose.model("Channel", entitySchema, "channels");
export const Product = mongoose.model("Product", entitySchema, "products");
export const PurchaseOrder = mongoose.model("PurchaseOrder", entitySchema, "purchase_orders");
export const SalesOrder = mongoose.model("SalesOrder", entitySchema, "sales_orders");
export const Invoice = mongoose.model("Invoice", entitySchema, "invoices");
export const Payment = mongoose.model("Payment", entitySchema, "payments");
export const Expense = mongoose.model("Expense", entitySchema, "expenses");
export const ReturnOrder = mongoose.model("ReturnOrder", entitySchema, "returns");
export const StockMovement = mongoose.model("StockMovement", entitySchema, "stock_movements");
export const Notification = mongoose.model("Notification", entitySchema, "notifications");
export const AuditLog = mongoose.model("AuditLog", entitySchema, "audit_logs");

export const collections = {
  categories: Category,
  suppliers: Supplier,
  customers: Customer,
  channels: Channel,
  products: Product,
  purchaseOrders: PurchaseOrder,
  salesOrders: SalesOrder,
  invoices: Invoice,
  payments: Payment,
  expenses: Expense,
  returns: ReturnOrder,
  stockMovements: StockMovement,
  notifications: Notification,
  auditLogs: AuditLog
};
