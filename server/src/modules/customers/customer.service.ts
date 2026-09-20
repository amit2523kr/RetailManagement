import { prisma } from '../../db/prisma.js';
import { NotFoundError } from '../../utils/errors.js';

export class CustomerService {
  static async listCustomers() {
    return await prisma.customer.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { salesOrders: true, invoices: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        salesOrders: { take: 10, orderBy: { createdAt: 'desc' } },
        invoices: { take: 10, orderBy: { createdAt: 'desc' } },
        payments: { take: 10, orderBy: { paymentDate: 'desc' } },
      },
    });

    if (!customer) {
      throw new NotFoundError(`Customer ${id} not found`);
    }

    return customer;
  }
}
