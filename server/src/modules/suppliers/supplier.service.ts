import { prisma } from '../../db/prisma.js';
import { NotFoundError } from '../../utils/errors.js';

export class SupplierService {
  static async listSuppliers() {
    return await prisma.supplier.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true, purchaseOrders: true } },
      },
      orderBy: { companyName: 'asc' },
    });
  }

  static async getSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: true,
        purchaseOrders: { take: 10, orderBy: { createdAt: 'desc' } },
        payments: { take: 10, orderBy: { paymentDate: 'desc' } },
      },
    });

    if (!supplier) {
      throw new NotFoundError(`Supplier ${id} not found`);
    }

    return supplier;
  }
}
