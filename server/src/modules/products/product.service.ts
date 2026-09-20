import { prisma } from '../../db/prisma.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { MovementType } from '@prisma/client';

export interface CreateProductInput {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  brand?: string;
  unit?: string;
  purchasePrice: number;
  sellingPrice: number;
  taxPercent?: number;
  discountPercent?: number;
  minStockLevel?: number;
  initialStock?: number;
  imageUrl?: string;
  categoryId: string;
  supplierId?: string;
}

export class ProductService {
  static async listProducts(query: {
    search?: string;
    categoryId?: string;
    supplierId?: string;
    stockStatus?: 'all' | 'low' | 'out_of_stock';
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.stockStatus === 'out_of_stock') {
      where.currentStock = 0;
    } else if (query.stockStatus === 'low') {
      where.currentStock = { lte: prisma.product.fields.minStockLevel };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          supplier: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        inventoryMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { performedByUser: { select: { name: true, email: true } } },
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    return product;
  }

  static async createProduct(input: CreateProductInput, userId: string) {
    // Check SKU or Barcode uniqueness
    const existingSku = await prisma.product.findUnique({ where: { sku: input.sku } });
    if (existingSku) {
      throw new BadRequestError(`Product with SKU '${input.sku}' already exists`);
    }

    if (input.barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode: input.barcode } });
      if (existingBarcode) {
        throw new BadRequestError(`Product with Barcode '${input.barcode}' already exists`);
      }
    }

    const initialStock = input.initialStock || 0;

    // Controlled transaction creating product & initial inventory ledger movement
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sku: input.sku,
          barcode: input.barcode,
          name: input.name,
          description: input.description,
          brand: input.brand,
          unit: input.unit || 'PCS',
          purchasePrice: input.purchasePrice,
          sellingPrice: input.sellingPrice,
          taxPercent: input.taxPercent || 0,
          discountPercent: input.discountPercent || 0,
          minStockLevel: input.minStockLevel || 10,
          currentStock: initialStock,
          imageUrl: input.imageUrl,
          categoryId: input.categoryId,
          supplierId: input.supplierId,
        },
        include: {
          category: true,
          supplier: true,
        },
      });

      if (initialStock > 0) {
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            quantity: initialStock,
            previousStock: 0,
            newStock: initialStock,
            type: MovementType.OPENING_STOCK,
            performedByUserId: userId,
            notes: 'Initial opening stock entry upon product creation',
          },
        });
      }

      // Record Audit Event
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE_PRODUCT',
          entity: 'Product',
          entityId: product.id,
          newState: JSON.stringify(product),
        },
      });

      return product;
    });
  }
}
