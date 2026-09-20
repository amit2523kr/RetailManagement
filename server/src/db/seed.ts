import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';
import { UserRoleName, MovementType, SalesChannelCode, PurchaseOrderStatus, SalesOrderStatus, InvoiceStatus, PaymentMethod, PaymentReferenceType } from '@prisma/client';
import { logger } from '../utils/logger.js';

async function main() {
  logger.info('Starting database seeding...');

  // 1. Roles
  const rolesMap = new Map<UserRoleName, string>();
  for (const roleName of Object.values(UserRoleName)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `Role for ${roleName}`,
      },
    });
    rolesMap.set(roleName, role.id);
  }

  // 2. Demo Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@retail.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@retail.com',
      passwordHash,
      roleId: rolesMap.get(UserRoleName.SUPER_ADMIN)!,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@retail.com' },
    update: {},
    create: {
      name: 'Vikram Sharma (Owner)',
      email: 'owner@retail.com',
      passwordHash,
      roleId: rolesMap.get(UserRoleName.BUSINESS_OWNER)!,
    },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@retail.com' },
    update: {},
    create: {
      name: 'Ankit Kumar (Sales)',
      email: 'sales@retail.com',
      passwordHash,
      roleId: rolesMap.get(UserRoleName.SALES_STAFF)!,
    },
  });

  const inventoryUser = await prisma.user.upsert({
    where: { email: 'inventory@retail.com' },
    update: {},
    create: {
      name: 'Suresh Patel (Inventory)',
      email: 'inventory@retail.com',
      passwordHash,
      roleId: rolesMap.get(UserRoleName.INVENTORY_STAFF)!,
    },
  });

  const accountantUser = await prisma.user.upsert({
    where: { email: 'accountant@retail.com' },
    update: {},
    create: {
      name: 'Pooja Verma (Accountant)',
      email: 'accountant@retail.com',
      passwordHash,
      roleId: rolesMap.get(UserRoleName.ACCOUNTANT)!,
    },
  });

  // 3. Sales Channels
  const channelsData = [
    { code: SalesChannelCode.PHYSICAL_STORE, name: 'Physical Store (Counter)' },
    { code: SalesChannelCode.WEBSITE, name: 'E-Commerce Website' },
    { code: SalesChannelCode.WHATSAPP, name: 'WhatsApp Direct Orders' },
    { code: SalesChannelCode.ZEPTO_MARKETPLACE, name: 'Zepto Marketplace' },
    { code: SalesChannelCode.AMAZON_MARKETPLACE, name: 'Amazon Storefront' },
  ];

  const channelMap = new Map<SalesChannelCode, string>();
  for (const ch of channelsData) {
    const channel = await prisma.salesChannel.upsert({
      where: { code: ch.code },
      update: {},
      create: ch,
    });
    channelMap.set(ch.code, channel.id);
  }

  // 4. Categories
  const categoriesData = [
    { code: 'BEV', name: 'Beverages', description: 'Soft drinks, juices, energy drinks' },
    { code: 'DAIRY', name: 'Dairy & Bakery', description: 'Milk, cheese, butter, bread' },
    { code: 'SNACK', name: 'Snacks & Confectionery', description: 'Chocolates, chips, biscuits' },
    { code: 'PCARE', name: 'Personal Care', description: 'Soaps, shampoos, oral care' },
    { code: 'HOUSE', name: 'Household Supplies', description: 'Detergents, cleaners, tissue' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.code, category.id);
  }

  // 5. Suppliers
  const suppliersData = [
    { supplierCode: 'SUP-001', companyName: 'Coca-Cola Bottling India', contactPerson: 'Rajesh Gupta', phone: '+91 9876543210', email: 'orders@cocacola.in', gstNumber: '07AAAAA0000A1Z5', creditLimit: 500000 },
    { supplierCode: 'SUP-002', companyName: 'PepsiCo India Holdings', contactPerson: 'Amitabh Sen', phone: '+91 9876543211', email: 'sales@pepsico.in', gstNumber: '07BBBBB0000B1Z6', creditLimit: 400000 },
    { supplierCode: 'SUP-003', companyName: 'Nestle India Distributors', contactPerson: 'Meera Nair', phone: '+91 9876543212', email: 'distribution@nestle.in', gstNumber: '07CCCCC0000C1Z7', creditLimit: 600000 },
    { supplierCode: 'SUP-004', companyName: 'Amul Dairy Federation', contactPerson: 'Ramesh Kurien', phone: '+91 9876543213', email: 'supply@amul.coop', gstNumber: '07DDDDD0000D1Z8', creditLimit: 300000 },
    { supplierCode: 'SUP-005', companyName: 'Britannia Foods Ltd', contactPerson: 'Karan Mehra', phone: '+91 9876543214', email: 'b2b@britannia.in', gstNumber: '07EEEEE0000E1Z9', creditLimit: 350000 },
  ];

  const supplierMap = new Map<string, string>();
  for (const sup of suppliersData) {
    const supplier = await prisma.supplier.upsert({
      where: { supplierCode: sup.supplierCode },
      update: {},
      create: sup,
    });
    supplierMap.set(sup.supplierCode, supplier.id);
  }

  // 6. Customers
  const customersData = [
    { customerCode: 'CUST-001', name: 'Rahul Sharma', businessName: 'FreshMart Supermarket', phone: '+91 9123456780', email: 'rahul@freshmart.in', creditLimit: 100000, outstandingBalance: 12500 },
    { customerCode: 'CUST-002', name: 'Priya Sundaram', businessName: 'QuickPick Express', phone: '+91 9123456781', email: 'priya@quickpick.in', creditLimit: 75000, outstandingBalance: 8200 },
    { customerCode: 'CUST-003', name: 'Sunil Verma', businessName: 'Metro Hypermarket', phone: '+91 9123456782', email: 'sunil@metro.in', creditLimit: 250000, outstandingBalance: 45000 },
    { customerCode: 'CUST-004', name: 'Deepak Joshi', businessName: 'City Corner Store', phone: '+91 9123456783', email: 'deepak@citycorner.in', creditLimit: 50000, outstandingBalance: 0 },
    { customerCode: 'CUST-005', name: 'Anita Rao', businessName: 'Apex Mini Mart', phone: '+91 9123456784', email: 'anita@apexmini.in', creditLimit: 120000, outstandingBalance: 18400 },
  ];

  const customerMap = new Map<string, string>();
  for (const cust of customersData) {
    const customer = await prisma.customer.upsert({
      where: { customerCode: cust.customerCode },
      update: {},
      create: cust,
    });
    customerMap.set(cust.customerCode, customer.id);
  }

  // 7. Products
  const productsData = [
    { sku: 'BEV-CC-500', barcode: '890102000101', name: 'Coca-Cola Original 500ml', brand: 'Coca-Cola', unit: 'PCS', purchasePrice: 32.0, sellingPrice: 40.0, minStockLevel: 50, currentStock: 180, categoryId: categoryMap.get('BEV')!, supplierId: supplierMap.get('SUP-001')! },
    { sku: 'BEV-PEPSI-500', barcode: '890102000102', name: 'Pepsi 500ml Pet Bottle', brand: 'Pepsi', unit: 'PCS', purchasePrice: 31.5, sellingPrice: 40.0, minStockLevel: 50, currentStock: 120, categoryId: categoryMap.get('BEV')!, supplierId: supplierMap.get('SUP-002')! },
    { sku: 'SNK-KITKAT-40', barcode: '890102000103', name: 'Nestle KitKat 40g 4-Finger', brand: 'Nestle', unit: 'PCS', purchasePrice: 22.0, sellingPrice: 30.0, minStockLevel: 40, currentStock: 250, categoryId: categoryMap.get('SNK')!, supplierId: supplierMap.get('SUP-003')! },
    { sku: 'DAIRY-AMUL-1L', barcode: '890102000104', name: 'Amul Taaza Toned Milk 1L Pack', brand: 'Amul', unit: 'PACK', purchasePrice: 54.0, sellingPrice: 60.0, minStockLevel: 100, currentStock: 8, categoryId: categoryMap.get('DAIRY')!, supplierId: supplierMap.get('SUP-004')! }, // LOW STOCK DEMO
    { sku: 'SNK-BRIT-GOOD', barcode: '890102000105', name: 'Britannia Good Day Butter 100g', brand: 'Britannia', unit: 'PCS', purchasePrice: 20.0, sellingPrice: 25.0, minStockLevel: 60, currentStock: 300, categoryId: categoryMap.get('SNK')!, supplierId: supplierMap.get('SUP-005')! },
    { sku: 'BEV-SPRITE-500', barcode: '890102000106', name: 'Sprite Lemon-Lime 500ml', brand: 'Coca-Cola', unit: 'PCS', purchasePrice: 32.0, sellingPrice: 40.0, minStockLevel: 30, currentStock: 0, categoryId: categoryMap.get('BEV')!, supplierId: supplierMap.get('SUP-001')! }, // OUT OF STOCK DEMO
  ];

  for (const prod of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });

    // Create opening stock inventory ledger movement
    if (prod.currentStock > 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          quantity: prod.currentStock,
          previousStock: 0,
          newStock: prod.currentStock,
          type: MovementType.OPENING_STOCK,
          performedByUserId: inventoryUser.id,
          notes: 'Initial opening stock ledger entry',
        },
      });
    }
  }

  logger.info('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    logger.error('Seeding error: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
