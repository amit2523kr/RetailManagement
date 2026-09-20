import { Router } from 'express';
import { SupplierService } from './supplier.service.js';
import { sendSuccess } from '../../utils/response.js';
import { asyncHandler } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';

export const supplierRouter = Router();

supplierRouter.use(authenticateToken);

supplierRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const suppliers = await SupplierService.listSuppliers();
    return sendSuccess(res, suppliers, 'Suppliers fetched');
  })
);

supplierRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const supplier = await SupplierService.getSupplierById(req.params.id);
    return sendSuccess(res, supplier, 'Supplier details fetched');
  })
);
