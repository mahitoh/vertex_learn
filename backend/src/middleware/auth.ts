import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    permissions: any;
    userId?: number; // Add this for compatibility
  };
}

// JWT Authentication Middleware
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
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
    const queryText = `
      SELECT 
        u.id, 
        u.email, 
        u.is_active,
        u.validation_status,
        r.name as role_name, 
        r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    
    const result = await db.query(queryText, [decoded.userId]);
    const user = result.rows[0];
    
    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Invalid or inactive user token.' 
      });
    }

    if (user.validation_status !== 'approved') {
      return res.status(403).json({ 
        error: 'Account not validated. Please wait for admin approval.' 
      });
    }

    req.user = {
      id: user.id,
      userId: user.id, // Add for compatibility
      email: user.email,
      role: user.role_name,
      permissions: user.role_description
    };

    next();
    return;
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
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
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
    return;
  };
};

// Module Access Control Middleware
export const requireModuleAccess = (module: string, action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
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
    return;
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

