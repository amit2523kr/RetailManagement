import { Router } from 'express';
import { CustomerService } from './customer.service.js';
import { sendSuccess } from '../../utils/response.js';
import { asyncHandler } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';

export const customerRouter = Router();

customerRouter.use(authenticateToken);

customerRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const customers = await CustomerService.listCustomers();
    return sendSuccess(res, customers, 'Customers fetched');
  })
);

customerRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await CustomerService.getCustomerById(req.params.id);
    return sendSuccess(res, customer, 'Customer details fetched');
  })
);
