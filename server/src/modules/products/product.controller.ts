import { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import { sendSuccess } from '../../utils/response.js';
import { asyncHandler, BadRequestError } from '../../utils/errors.js';
import { z } from 'zod';

const createProductSchema = z.object({
  sku: z.string().min(2),
  barcode: z.string().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  brand: z.string().optional(),
  unit: z.string().optional(),
  purchasePrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  taxPercent: z.number().min(0).optional(),
  discountPercent: z.number().min(0).optional(),
  minStockLevel: z.number().int().min(0).optional(),
  initialStock: z.number().int().min(0).optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().uuid(),
  supplierId: z.string().uuid().optional(),
});

export class ProductController {
  static listProducts = asyncHandler(async (req: Request, res: Response) => {
    const { search, categoryId, supplierId, stockStatus, page, limit } = req.query;

    const result = await ProductService.listProducts({
      search: search as string,
      categoryId: categoryId as string,
      supplierId: supplierId as string,
      stockStatus: stockStatus as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    return sendSuccess(res, result.products, 'Products retrieved successfully', 200, result.meta);
  });

  static getProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    return sendSuccess(res, product, 'Product detail retrieved successfully');
  });

  static createProduct = asyncHandler(async (req: Request, res: Response) => {
    const parseResult = createProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new BadRequestError('Invalid product parameters', parseResult.error.flatten());
    }

    const userId = req.user!.id;
    const product = await ProductService.createProduct(parseResult.data, userId);
    return sendSuccess(res, product, 'Product created successfully', 201);
  });
}
