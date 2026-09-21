import mongoose from "mongoose";
import { seedDb } from "./store.js";
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
  User
} from "./models.js";

const defaultUri = "mongodb://127.0.0.1:27017/retail_platform";

export async function connectDatabase() {
  const uri = process.env.MONGO_URI || defaultUri;
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ Connected to MongoDB successfully.`);
  } catch (error) {
    console.error(`\n❌ [Database Error] Could not connect to MongoDB at: ${uri}`);
    console.error(`👉 If deploying to Render/cloud, please set the 'MONGO_URI' environment variable in your dashboard (e.g. from MongoDB Atlas Free M0).`);
    console.error(`Details: ${error.message}\n`);
    throw error;
  }
  await seedIfEmpty();
  await syncRoles();
}

export async function syncRoles() {
  const seed = seedDb();
  for (const r of seed.roles) {
    await Role.findOneAndUpdate(
      { $or: [{ id: r.id }, { name: r.name }, { name: r.id }] },
      {
        $set: {
          id: r.id,
          name: r.name,
          description: r.description,
          permissions: r.permissions,
          isSystemRole: true
        }
      },
      { upsert: true, new: true }
    );
  }
}

export async function seedIfEmpty() {
  const [hasExpectedProduct, hasExpectedChannel, hasExpectedUser] = await Promise.all([
    Product.exists({ id: "prd_coke_500" }),
    Channel.exists({ id: "chn_direct" }),
    User.exists({ token: "owner-token" })
  ]);
  if (hasExpectedProduct && hasExpectedChannel && hasExpectedUser) return;
  await Promise.all([
    Role.deleteMany({}),
    User.deleteMany({}),
    Category.deleteMany({}),
    Supplier.deleteMany({}),
    Customer.deleteMany({}),
    Channel.deleteMany({}),
    Product.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    SalesOrder.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
    Expense.deleteMany({}),
    ReturnOrder.deleteMany({}),
    StockMovement.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
  const seed = seedDb();
  await Promise.all([
    Role.insertMany(seed.roles),
    User.insertMany(seed.users),
    Category.insertMany(seed.categories),
    Supplier.insertMany(seed.suppliers),
    Customer.insertMany(seed.customers),
    Channel.insertMany(seed.channels),
    Product.insertMany(seed.products),
    PurchaseOrder.insertMany(seed.purchaseOrders),
    SalesOrder.insertMany(seed.salesOrders),
    Invoice.insertMany(seed.invoices),
    Payment.insertMany(seed.payments),
    Expense.insertMany(seed.expenses),
    ReturnOrder.insertMany(seed.returns),
    StockMovement.insertMany(seed.stockMovements),
    Notification.insertMany(seed.notifications),
    AuditLog.insertMany(seed.auditLogs)
  ]);
}

export async function readDomainDb() {
  const [
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
    expenses,
    returns,
    stockMovements,
    notifications,
    auditLogs
  ] = await Promise.all([
    Role.find().lean(),
    User.find().lean(),
    Category.find().lean(),
    Supplier.find().lean(),
    Customer.find().lean(),
    Channel.find().lean(),
    Product.find().lean(),
    PurchaseOrder.find().lean(),
    SalesOrder.find().lean(),
    Invoice.find().lean(),
    Payment.find().lean(),
    Expense.find().lean(),
    ReturnOrder.find().lean(),
    StockMovement.find().lean(),
    Notification.find().lean(),
    AuditLog.find().sort({ createdAt: -1 }).limit(100).lean()
  ]);
  return {
    roles: Object.fromEntries(roles.map((role) => [role.name, role.permissions])),
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
    expenses,
    returns,
    stockMovements,
    notifications,
    auditLogs
  };
}
