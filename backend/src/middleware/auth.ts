import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../config/database.js";

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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    // Get user with role and permissions
    const queryText = `
      SELECT 
        u.id, 
        u.email, 
        u.is_active,
        u.approval_status,
        u.role_id,
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
        error: "Invalid or inactive user token.",
      });
    }

    console.log("User validation check:", {
      userId: user.id,
      email: user.email,
      role: user.role_name,
      approval_status: user.approval_status,
    });

    // Check approval status for non-super admin users
    if (user.role_name !== "super_admin") {
      if (user.approval_status !== "approved") {
        return res.status(401).json({
          error:
            "Account pending approval. Please wait for admin verification.",
        });
      }
    }

    req.user = {
      id: user.id,
      userId: user.id, // Add for compatibility
      email: user.email,
      role: user.role_name,
      permissions: user.role_description,
    };

    next();
    return;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid token.",
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: "Token expired.",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Internal server error during authentication.",
    });
  }
};

// Role-based Access Control Middleware (Updated for new role structure)
export const requireRole = (allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions for this action.",
      });
    }

    next();
    return;
  };
};

// Module Access Control Middleware
export const requireModuleAccess = (module: string, action: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const permissions = req.user.permissions as any;

    // Check if user has access to the module and action
    if (
      !permissions ||
      !permissions.modules?.includes(module) ||
      !permissions.actions?.includes(action)
    ) {
      return res.status(403).json({
        error: `Insufficient permissions for ${action} on ${module} module.`,
      });
    }

    next();
    return;
  };
};

// Updated Role-Specific Middleware for new role structure
export const requireSuperAdmin = requireRole(["super_admin"]);
export const requireOrgAdmin = requireRole(["org_admin"]);
export const requireFinanceManager = requireRole(["finance_manager"]);
export const requireTeacher = requireRole(["teacher"]);
export const requireStudent = requireRole(["student"]);

// Combined Role Access Middleware
export const requireSuperOrOrgAdmin = requireRole(["super_admin", "org_admin"]);
export const requireAdminOrFinance = requireRole([
  "super_admin",
  "org_admin",
  "finance_manager",
]);
export const requireTeacherOrAdmin = requireRole([
  "super_admin",
  "org_admin",
  "teacher",
]);
export const requireAnyStaff = requireRole([
  "super_admin",
  "org_admin",
  "finance_manager",
  "teacher",
]);

// Legacy middleware (for backward compatibility)
export const requireAdmin = requireRole(["super_admin", "org_admin"]); // Maps old 'admin' to new roles
export const requireStaffOrAdmin = requireRole([
  "super_admin",
  "org_admin",
  "finance_manager",
  "teacher",
]);
