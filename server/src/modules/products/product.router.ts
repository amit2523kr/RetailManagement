import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';
import { UserRoleName } from '@prisma/client';

export const productRouter = Router();

productRouter.use(authenticateToken);

productRouter.get('/', ProductController.listProducts);
productRouter.get('/:id', ProductController.getProduct);
productRouter.post(
  '/',
  requireRole(UserRoleName.SUPER_ADMIN, UserRoleName.BUSINESS_OWNER, UserRoleName.MANAGER),
  ProductController.createProduct
);
