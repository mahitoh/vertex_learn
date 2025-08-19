import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { CustomError } from './errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        email: string;
        role: 'admin' | 'student' | 'staff';
        first_name?: string;
        last_name?: string;
      };
    }
  }
}

interface JWTPayload {
  user_id: number;
  email: string;
  role: 'admin' | 'student' | 'staff';
  iat?: number;
  exp?: number;
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check for token in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new CustomError('Access token required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Get user from database
    const user = await User.findByPk(decoded.user_id, {
      attributes: ['user_id', 'email', 'role', 'first_name', 'last_name', 'is_active'],
    });

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    if (!user.is_active) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Add user to request object
    req.user = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to authorize based on user roles
 */
export const authorizeRoles = (...roles: Array<'admin' | 'student' | 'staff'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new CustomError('Insufficient permissions', 403);
    }

    next();
  };
};

/**
 * Middleware for admin-only access
 */
export const requireAdmin = authorizeRoles('admin');

/**
 * Middleware for staff and admin access
 */
export const requireStaffOrAdmin = authorizeRoles('staff', 'admin');

/**
 * Middleware for student access (students can only access their own data)
 */
export const requireStudentAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401);
  }

  const { role, user_id } = req.user;
  const requestedUserId = parseInt(req.params.userId || req.params.id);

  // Admin and staff can access any student data
  if (role === 'admin' || role === 'staff') {
    return next();
  }

  // Students can only access their own data
  if (role === 'student' && user_id === requestedUserId) {
    return next();
  }

  throw new CustomError('Access denied', 403);
};

/**
 * Optional authentication middleware (doesn't throw error if no token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authenticateToken(req, res, next);
  } catch (error) {
    // Continue without authentication
    next();
  }
};
