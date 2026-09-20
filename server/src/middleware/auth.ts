import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { UserRoleName } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleName;
  permissions?: string[]; // Array of "action:resource" strings
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token required');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const requireRole = (...allowedRoles: UserRoleName[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.role === UserRoleName.SUPER_ADMIN) {
      return next(); // Super Admin bypasses role checks
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied. Requires one of roles: ${allowedRoles.join(', ')}`);
    }

    next();
  };
};

export const requirePermission = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.role === UserRoleName.SUPER_ADMIN) {
      return next();
    }

    const requiredPerm = `${action}:${resource}`;
    if (!req.user.permissions || !req.user.permissions.includes(requiredPerm)) {
      throw new ForbiddenError(`Permission required: ${requiredPerm}`);
    }

    next();
  };
};
