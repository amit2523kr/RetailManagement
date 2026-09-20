import {
  BarChart3,
  Boxes,
  BrainCircuit,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Truck,
  RotateCcw
} from "lucide-react";

export const VIEWS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, subtitle: "Live business health, inventory risk, cash exposure, and operating signals." },
  { id: "products", label: "Products", icon: ClipboardList, subtitle: "Catalog, prices, taxes, reorder levels, and stock position." },
  { id: "inventory", label: "Inventory", icon: Boxes, subtitle: "Stock movements, double-entry ledger, and operating exceptions." },
  { id: "orders", label: "Orders", icon: BarChart3, subtitle: "Purchase and sales flow across suppliers, customers, and channels." },
  { id: "returns", label: "Returns & RMA", icon: RotateCcw, subtitle: "Customer returns, RMA processing, restock & credit refunds." },
  { id: "customers", label: "Customers", icon: Users, subtitle: "Customer directory, receivables, credit limits, and GSTIN master." },
  { id: "suppliers", label: "Suppliers", icon: Truck, subtitle: "Supplier master directory, payables, payment terms, and contacts." },
  { id: "finance", label: "Finance", icon: CreditCard, subtitle: "Invoices, payments, expenses, and outstanding balances." },
  { id: "admin", label: "Admin", icon: ShieldCheck, subtitle: "Users, roles, permissions, auditability, and notifications." },
  { id: "copilot", label: "AI Copilot", icon: BrainCircuit, subtitle: "Business recommendations & copilot insights derived from operating data." }
];

export const DEMO_TOKENS = [
  { label: "Super Admin", token: "super-token", role: "SUPER_ADMIN", desc: "Full global root access" },
  { label: "Business Owner", token: "owner-token", role: "BUSINESS_OWNER", desc: "Executive dashboard & all operations" },
  { label: "Store Manager", token: "manager-token", role: "MANAGER", desc: "Catalog & order management" },
  { label: "Sales Staff", token: "sales-token", role: "SALES_STAFF", desc: "Point of sale & orders creation" },
  { label: "Inventory Staff", token: "inventory-token", role: "INVENTORY_STAFF", desc: "Stock adjustments & movements" },
  { label: "Accountant", token: "accountant-token", role: "ACCOUNTANT", desc: "Invoicing & payments reconciliation" }
];

export const ALL_AVAILABLE_PERMISSIONS = [
  { key: "catalog:read", label: "Read Catalog & Products", group: "Catalog" },
  { key: "catalog:manage", label: "Manage Products & Categories", group: "Catalog" },
  { key: "inventory:read", label: "Read Stock & Ledger", group: "Inventory" },
  { key: "inventory:manage", label: "Adjust Stock & Inventory", group: "Inventory" },
  { key: "purchases:receive", label: "Receive Purchase Orders", group: "Inventory" },
  { key: "returns:manage", label: "Manage Customer Returns", group: "Inventory" },
  { key: "sales:create", label: "Create POS Sales Orders", group: "Sales" },
  { key: "orders:manage", label: "Manage Sales & Purchase Orders", group: "Sales" },
  { key: "customers:read", label: "Read Customer Profiles", group: "Partners" },
  { key: "partners:manage", label: "Manage Suppliers & Customers", group: "Partners" },
  { key: "invoices:read", label: "Read Invoices & Receipts", group: "Finance" },
  { key: "invoices:create", label: "Auto-Generate Invoices", group: "Finance" },
  { key: "financials:read", label: "Read Operating P&L", group: "Finance" },
  { key: "payments:manage", label: "Manage Payments & Expenses", group: "Finance" },
  { key: "users:manage", label: "Manage Users & Accounts", group: "Admin" },
  { key: "roles:manage", label: "Manage Dynamic RBAC Roles", group: "Admin" },
  { key: "audit:read", label: "View Audit Log Trail", group: "Admin" },
  { key: "copilot:read", label: "Access AI Business Copilot", group: "Copilot" }
];
