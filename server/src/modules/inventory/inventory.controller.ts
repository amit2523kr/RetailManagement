import { Request, Response } from 'express';
import { InventoryService } from './inventory.service.js';
import { sendSuccess } from '../../utils/response.js';
import { asyncHandler, BadRequestError } from '../../utils/errors.js';
import { MovementType } from '@prisma/client';
import { z } from 'zod';

const manualAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  quantityChange: z.number().int(), // Positive or negative integer
  type: z.nativeEnum(MovementType),
  notes: z.string().optional(),
});

export class InventoryController {
  static listMovements = asyncHandler(async (req: Request, res: Response) => {
    const { productId, type, page, limit } = req.query;

    const result = await InventoryService.listMovements({
      productId: productId as string,
      type: type as MovementType,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    return sendSuccess(res, result.movements, 'Inventory movements retrieved successfully', 200, result.meta);
  });

  static getLowStockAlerts = asyncHandler(async (req: Request, res: Response) => {
    const alerts = await InventoryService.getLowStockAlerts();
    return sendSuccess(res, alerts, 'Low stock alerts fetched successfully');
  });

  static createAdjustment = asyncHandler(async (req: Request, res: Response) => {
    const parseResult = manualAdjustmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new BadRequestError('Invalid adjustment inputs', parseResult.error.flatten());
    }

    const userId = req.user!.id;
    const result = await InventoryService.recordMovement({
      productId: parseResult.data.productId,
      quantityChange: parseResult.data.quantityChange,
      type: parseResult.data.type,
      userId,
      notes: parseResult.data.notes || 'Manual stock adjustment',
    });

    return sendSuccess(res, result, 'Stock adjustment recorded in inventory ledger', 201);
  });
}
