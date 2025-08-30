import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    permissions: any;
  };
}

// JWT Authentication Middleware
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    // Get user with role and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid or inactive user token.' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expired.' 
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during authentication.' 
    });
  }
};

// Role-based Access Control Middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions for this action.' 
      });
    }

    next();
  };
};

// Module Access Control Middleware
export const requireModuleAccess = (module: string, action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    const permissions = req.user.permissions as any;
    
    // Check if user has access to the module and action
    if (!permissions || 
        !permissions.modules?.includes(module) || 
        !permissions.actions?.includes(action)) {
      return res.status(403).json({ 
        error: `Insufficient permissions for ${action} on ${module} module.` 
      });
    }

    next();
  };
};

// Admin-only Access Middleware
export const requireAdmin = requireRole(['admin']);

// Teacher or Admin Access Middleware
export const requireTeacherOrAdmin = requireRole(['teacher', 'admin']);

// Student Access Middleware
export const requireStudent = requireRole(['student']);

// Staff or Admin Access Middleware
export const requireStaffOrAdmin = requireRole(['staff', 'admin']);

