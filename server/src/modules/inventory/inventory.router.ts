import { Router } from 'express';
import { InventoryController } from './inventory.controller.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';
import { UserRoleName } from '@prisma/client';

export const inventoryRouter = Router();

inventoryRouter.use(authenticateToken);

inventoryRouter.get('/movements', InventoryController.listMovements);
inventoryRouter.get('/low-stock', InventoryController.getLowStockAlerts);
inventoryRouter.post(
  '/adjustments',
  requireRole(
    UserRoleName.SUPER_ADMIN,
    UserRoleName.BUSINESS_OWNER,
    UserRoleName.MANAGER,
    UserRoleName.INVENTORY_STAFF
  ),
  InventoryController.createAdjustment
);
