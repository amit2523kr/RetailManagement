import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma.js';
import { ENV } from '../../config/env.js';
import { BadRequestError, UnauthorizedError } from '../../utils/errors.js';
import { UserRoleName } from '@prisma/client';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Extract formatted permissions list e.g. "read:products"
    const permissions = user.role.permissions.map(
      (rp) => `${rp.permission.action}:${rp.permission.resource}`
    );

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      permissions,
    };

    const token = jwt.sign(tokenPayload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as any,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions,
      },
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const permissions = user.role.permissions.map(
      (rp) => `${rp.permission.action}:${rp.permission.resource}`
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      permissions,
      createdAt: user.createdAt,
    };
  }
}
