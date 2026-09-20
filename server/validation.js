import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(4, { message: "Password must be at least 4 characters" })
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.string().optional().default("SALES_STAFF")
});

export const productSchema = z.object({
  sku: z.string().min(1, { message: "SKU is required" }),
  name: z.string().min(1, { message: "Product name is required" }),
  category: z.string().optional().default("General"),
  brand: z.string().optional(),
  unit: z.string().optional().default("PCS"),
  purchasePrice: z.number().nonnegative({ message: "Purchase price must be >= 0" }),
  sellingPrice: z.number().nonnegative({ message: "Selling price must be >= 0" }),
  tax: z.number().optional().default(18),
  minimumStockLevel: z.number().int().optional().default(10),
  currentStock: z.number().int().optional().default(0),
  barcode: z.string().optional(),
  description: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional()
});

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const customerSchema = z.object({
  name: z.string().min(2, { message: "Customer name must be at least 2 characters" }),
  businessName: z.string().optional().default(""),
  email: z.string().email({ message: "Invalid email format" }).or(z.literal("")),
  phone: z.string().optional().default(""),
  gstin: z.string().refine(val => !val || gstinRegex.test(val), { message: "Invalid 15-character GSTIN format" }).optional().default(""),
  creditLimit: z.number().nonnegative({ message: "Credit limit must be >= 0" }).optional().default(50000),
  outstanding: z.number().nonnegative().optional().default(0),
  address: z.string().optional().default("")
});

export const supplierSchema = z.object({
  name: z.string().min(2, { message: "Supplier name must be at least 2 characters" }),
  companyName: z.string().optional().default(""),
  contact: z.string().optional().default(""),
  email: z.string().email({ message: "Invalid email format" }).or(z.literal("")),
  gstin: z.string().refine(val => !val || gstinRegex.test(val), { message: "Invalid 15-character GSTIN format" }).optional().default(""),
  paymentTerms: z.string().optional().default("Net 30"),
  outstanding: z.number().nonnegative().optional().default(0),
  address: z.string().optional().default("")
});

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  quantity: z.number().int({ message: "Quantity must be an integer" }),
  type: z.enum([
    "MANUAL_ADJUSTMENT",
    "PURCHASE_RECEIPT",
    "DAMAGE",
    "EXPIRED",
    "RETURN"
  ], { message: "Invalid adjustment type" }),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional()
});

export const salesOrderSchema = z.object({
  customerId: z.string().min(1, { message: "Customer ID is required" }),
  channelId: z.string().optional().default("chn_direct"),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive({ message: "Quantity must be > 0" }),
    unitPrice: z.number().nonnegative({ message: "Unit price must be >= 0" }),
    tax: z.number().optional().default(18)
  })).min(1, { message: "At least one line item is required" }),
  notes: z.string().optional()
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, { message: "Supplier ID is required" }),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive({ message: "Quantity must be > 0" }),
    unitPrice: z.number().nonnegative({ message: "Unit price must be >= 0" }),
    tax: z.number().optional().default(18)
  })).min(1, { message: "At least one line item is required" }),
  notes: z.string().optional()
});

export const returnOrderSchema = z.object({
  salesOrderId: z.string().min(1, { message: "Sales Order ID is required" }),
  customerId: z.string().min(1, { message: "Customer ID is required" }),
  productId: z.string().min(1, { message: "Product ID is required" }),
  quantity: z.number().int().positive({ message: "Return quantity must be > 0" }),
  reason: z.enum(["DAMAGED_GOODS", "WRONG_ITEM", "EXPIRED_PRODUCT", "CUSTOMER_CHANGE_OF_MIND"]),
  action: z.enum(["RESTOCK", "SCRAP"]),
  refundAmount: z.number().nonnegative({ message: "Refund amount must be >= 0" }),
  notes: z.string().optional()
});

export const paymentSchema = z.object({
  type: z.enum(["CUSTOMER_RECEIPT", "SUPPLIER_PAYMENT"]),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  invoiceId: z.string().optional(),
  amount: z.number().positive({ message: "Payment amount must be > 0" }),
  method: z.string().min(1, { message: "Payment method is required" }),
  notes: z.string().optional()
});

export const expenseSchema = z.object({
  category: z.string().min(1, { message: "Expense category is required" }),
  amount: z.number().positive({ message: "Expense amount must be > 0" }),
  method: z.string().optional().default("UPI"),
  notes: z.string().optional()
});

export const userCreateSchema = z.object({
  name: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  role: z.string().min(1, { message: "Role is required" }),
  password: z.string().optional().default("Password123!")
});

export const roleCreateSchema = z.object({
  name: z.string().min(2, { message: "Role name must be at least 2 characters" }),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([])
});

/**
 * Reusable Express validation middleware for Zod schemas
 */
export function validate(schema, target = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message
      }));
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Invalid request payload",
        details: formattedErrors
      });
    }
    req[target] = result.data;
    next();
  };
}
