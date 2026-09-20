import { prisma } from '../../db/prisma.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { MovementType } from '@prisma/client';

export interface RecordMovementInput {
  productId: string;
  quantityChange: number; // Positive for stock additions, Negative for reductions
  type: MovementType;
  referenceDocId?: string;
  referenceDocType?: string;
  userId: string;
  notes?: string;
}

export class InventoryService {
  /**
   * Core double-entry inventory ledger function.
   * Modifies currentStock and creates an immutable InventoryMovement record atomically in a transaction.
   */
  static async recordMovement(input: RecordMovementInput, tx?: any) {
    const db = tx || prisma;

    const product = await db.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw new NotFoundError(`Product ${input.productId} not found`);
    }

    const previousStock = product.currentStock;
    const newStock = previousStock + input.quantityChange;

    // Prevent stock going negative
    if (newStock < 0) {
      throw new BadRequestError(
        `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available: ${previousStock}, Requested change: ${input.quantityChange}`
      );
    }

    // Execute atomic update and ledger entry
    const [updatedProduct, movement] = await Promise.all([
      db.product.update({
        where: { id: input.productId },
        data: { currentStock: newStock },
      }),
      db.inventoryMovement.create({
        data: {
          productId: input.productId,
          quantity: input.quantityChange,
          previousStock,
          newStock,
          type: input.type,
          referenceDocId: input.referenceDocId,
          referenceDocType: input.referenceDocType,
          performedByUserId: input.userId,
          notes: input.notes,
        },
      }),
    ]);

    // Create low-stock notification if stock falls below minStockLevel
    if (newStock <= product.minStockLevel && previousStock > product.minStockLevel) {
      await db.notification.create({
        data: {
          title: 'Low Stock Alert',
          message: `Product '${product.name}' (${product.sku}) is below minimum stock level. Current stock: ${newStock} (Min: ${product.minStockLevel}).`,
          type: 'LOW_STOCK',
        },
      });
    }

    return { product: updatedProduct, movement };
  }

  static async listMovements(query: { productId?: string; type?: MovementType; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.productId) where.productId = query.productId;
    if (query.type) where.type = query.type;

    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true, unit: true } },
          performedByUser: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    return {
      movements,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getLowStockAlerts() {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        currentStock: { lte: prisma.product.fields.minStockLevel },
      },
      include: { category: true, supplier: true },
      orderBy: { currentStock: 'asc' },
    });
  }
}
