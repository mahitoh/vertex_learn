import { Router, Request, Response } from "express";
import { query } from "../config/database.js";
import { authenticateJWT, requireSuperAdmin } from "../middleware/auth.js";
import { validatePagination, validateId } from "../middleware/validation.js";
import bcrypt from "bcryptjs";

const router = Router();

// GET /api/organizations - Get all organizations (Super Admin only)
router.get(
  "/",
  authenticateJWT,
  requireSuperAdmin,
  validatePagination,
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause = "WHERE 1=1";
      const params: any[] = [];

      if (status) {
        whereClause += " AND o.status = ?";
        params.push(status);
      }

      // Get organizations with admin info and statistics
      const orgsResult = await query(
        `
      SELECT 
        o.*,
        u.name as admin_name,
        u.email as admin_email,
        u.is_active as admin_active,
        (SELECT COUNT(*) FROM users WHERE organization_id = o.id AND role_id = 3) as teacher_count,
        (SELECT COUNT(*) FROM users WHERE organization_id = o.id AND role_id = 4) as student_count,
        (SELECT COUNT(*) FROM users WHERE organization_id = o.id AND role_id = 5) as staff_count,
        (SELECT COUNT(*) FROM users WHERE organization_id = o.id) as total_users
      FROM organizations o
      LEFT JOIN users u ON o.id = u.organization_id AND u.role_id = 2 AND u.is_active = true
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `,
        [...params, Number(limit), offset]
      );

      // Get total count
      const countResult = await query(
        `
      SELECT COUNT(*) as total 
      FROM organizations o
      ${whereClause}
    `,
        params
      );

      const total = countResult.rows[0].total;

      res.json({
        organizations: orgsResult.rows,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Get organizations error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// POST /api/organizations - Create new organization (Super Admin only)
router.post(
  "/",
  authenticateJWT,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        code,
        description,
        address,
        phone,
        email,
        website,
        subscription_plan = "basic",
      } = req.body;

      // Validate required fields
      if (!name || !code || !email) {
        return res.status(400).json({
          error: "Name, code, and email are required",
        });
      }

      // Check if organization with same code or email exists
      const existingResult = await query(
        `
      SELECT id FROM organizations 
      WHERE code = ? OR email = ?
    `,
        [code, email]
      );

      if (existingResult.rows.length > 0) {
        return res.status(400).json({
          error: "Organization with this code or email already exists",
        });
      }

      // Create organization
      const result = await query(
        `
      INSERT INTO organizations (
        name, code, description, address, phone, email, website, 
        subscription_plan, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', NOW())
    `,
        [
          name,
          code,
          description,
          address,
          phone,
          email,
          website,
          subscription_plan,
        ]
      );

      // Get the created organization
      const newOrgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ?
    `,
        [result.insertId]
      );

      res.status(201).json({
        message: "Organization created successfully",
        organization: newOrgResult.rows[0],
      });
    } catch (error) {
      console.error("Create organization error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// PUT /api/organizations/:id - Update organization (Super Admin only)
router.put(
  "/:id",
  authenticateJWT,
  requireSuperAdmin,
  validateId,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        name,
        code,
        description,
        address,
        phone,
        email,
        website,
        subscription_plan,
        status,
      } = req.body;

      // Check if organization exists
      const orgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ?
    `,
        [id]
      );

      if (orgResult.rows.length === 0) {
        return res.status(404).json({
          error: "Organization not found",
        });
      }

      // Check for duplicate code/email (excluding current org)
      if (code || email) {
        const duplicateResult = await query(
          `
        SELECT id FROM organizations 
        WHERE (code = ? OR email = ?) AND id != ?
      `,
          [code || "", email || "", id]
        );

        if (duplicateResult.rows.length > 0) {
          return res.status(400).json({
            error: "Organization with this code or email already exists",
          });
        }
      }

      // Update organization
      await query(
        `
      UPDATE organizations 
      SET name = COALESCE(?, name),
          code = COALESCE(?, code),
          description = COALESCE(?, description),
          address = COALESCE(?, address),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          website = COALESCE(?, website),
          subscription_plan = COALESCE(?, subscription_plan),
          status = COALESCE(?, status),
          updated_at = NOW()
      WHERE id = ?
    `,
        [
          name,
          code,
          description,
          address,
          phone,
          email,
          website,
          subscription_plan,
          status,
          id,
        ]
      );

      // Get updated organization
      const updatedOrgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ?
    `,
        [id]
      );

      res.json({
        message: "Organization updated successfully",
        organization: updatedOrgResult.rows[0],
      });
    } catch (error) {
      console.error("Update organization error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// DELETE /api/organizations/:id - Delete organization (Super Admin only)
router.delete(
  "/:id",
  authenticateJWT,
  requireSuperAdmin,
  validateId,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if organization exists
      const orgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ?
    `,
        [id]
      );

      if (orgResult.rows.length === 0) {
        return res.status(404).json({
          error: "Organization not found",
        });
      }

      // Check if organization has users
      const usersResult = await query(
        `
      SELECT COUNT(*) as user_count FROM users WHERE organization_id = ?
    `,
        [id]
      );

      if (usersResult.rows[0].user_count > 0) {
        return res.status(400).json({
          error:
            "Cannot delete organization with existing users. Please transfer or remove users first.",
        });
      }

      // Delete organization
      await query(
        `
      DELETE FROM organizations WHERE id = ?
    `,
        [id]
      );

      res.json({
        message: "Organization deleted successfully",
      });
    } catch (error) {
      console.error("Delete organization error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// POST /api/organizations/:id/admin - Create organization admin (Super Admin only)
router.post(
  "/:id/admin",
  authenticateJWT,
  requireSuperAdmin,
  validateId,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, password, phone, department } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Name, email, and password are required",
        });
      }

      // Check if organization exists
      const orgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ?
    `,
        [id]
      );

      if (orgResult.rows.length === 0) {
        return res.status(404).json({
          error: "Organization not found",
        });
      }

      // Check if email already exists
      const existingUserResult = await query(
        `
      SELECT id FROM users WHERE email = ?
    `,
        [email]
      );

      if (existingUserResult.rows.length > 0) {
        return res.status(400).json({
          error: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user (role_id = 2 for organization admin)
      const result = await query(
        `
      INSERT INTO users (
        name, email, password, role_id, organization_id, 
        phone, department, validation_status, is_active, created_at
      ) VALUES (?, ?, ?, 2, ?, ?, ?, 'approved', true, NOW())
    `,
        [name, email, hashedPassword, id, phone, department]
      );

      // Get created user info
      const newUserResult = await query(
        `
      SELECT u.*, r.name as role_name, o.name as organization_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = ?
    `,
        [result.insertId]
      );

      res.status(201).json({
        message: "Organization admin created successfully",
        admin: newUserResult.rows[0],
      });
    } catch (error) {
      console.error("Create organization admin error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /api/organizations/:id/stats - Get organization statistics (Super Admin only)
router.get(
  "/:id/stats",
  authenticateJWT,
  requireSuperAdmin,
  validateId,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if organization exists
      const orgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ?
    `,
        [id]
      );

      if (orgResult.rows.length === 0) {
        return res.status(404).json({
          error: "Organization not found",
        });
      }

      // Get comprehensive statistics
      const statsResult = await query(
        `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE organization_id = ? AND role_id = 2) as admin_count,
        (SELECT COUNT(*) FROM users WHERE organization_id = ? AND role_id = 3) as teacher_count,
        (SELECT COUNT(*) FROM users WHERE organization_id = ? AND role_id = 4) as student_count,
        (SELECT COUNT(*) FROM users WHERE organization_id = ? AND role_id = 5) as staff_count,
        (SELECT COUNT(*) FROM users WHERE organization_id = ? AND is_active = true) as active_users,
        (SELECT COUNT(*) FROM users WHERE organization_id = ? AND validation_status = 'pending') as pending_users,
        (SELECT COUNT(*) FROM courses WHERE instructor_id IN (SELECT id FROM users WHERE organization_id = ?)) as course_count,
        (SELECT COUNT(*) FROM enrollments e JOIN users u ON e.student_id = u.id WHERE u.organization_id = ?) as enrollment_count
    `,
        [id, id, id, id, id, id, id, id]
      );

      res.json({
        organization: orgResult.rows[0],
        stats: statsResult.rows[0],
      });
    } catch (error) {
      console.error("Get organization stats error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /api/organizations/pending - Get pending organizations (Super Admin only)
router.get(
  "/pending",
  authenticateJWT,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const pendingOrgsResult = await query(`
      SELECT 
        o.*,
        u.name as admin_name,
        u.email as admin_email
      FROM organizations o
      LEFT JOIN users u ON o.id = u.organization_id AND u.role_id = 2
      WHERE o.status = 'pending'
      ORDER BY o.created_at ASC
    `);

      res.json({
        organizations: pendingOrgsResult.rows,
      });
    } catch (error) {
      console.error("Get pending organizations error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /api/organizations/all - Get all organizations (Super Admin only)
router.get(
  "/all",
  authenticateJWT,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const allOrgsResult = await query(`
      SELECT 
        o.*,
        u.name as admin_name,
        u.email as admin_email,
        (SELECT COUNT(*) FROM users WHERE organization_id = o.id) as user_count
      FROM organizations o
      LEFT JOIN users u ON o.id = u.organization_id AND u.role_id = 2
      ORDER BY o.created_at DESC
    `);

      res.json({
        organizations: allOrgsResult.rows,
      });
    } catch (error) {
      console.error("Get all organizations error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// PATCH /api/organizations/:id/approve - Approve organization (Super Admin only)
router.patch(
  "/:id/approve",
  authenticateJWT,
  requireSuperAdmin,
  validateId,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminId = (req as any).user.userId;

      // Check if organization exists and is pending
      const orgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ? AND status = 'pending'
    `,
        [id]
      );

      if (orgResult.rows.length === 0) {
        return res.status(404).json({
          error: "Organization not found or not in pending status",
        });
      }

      // Approve organization
      await query(
        `
      UPDATE organizations 
      SET status = 'approved', 
          approved_by = ?, 
          approved_at = NOW()
      WHERE id = ?
    `,
        [adminId, id]
      );

      // Get updated organization
      const updatedOrgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ?
    `,
        [id]
      );

      res.json({
        message: "Organization approved successfully",
        organization: updatedOrgResult.rows[0],
      });
    } catch (error) {
      console.error("Approve organization error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// PATCH /api/organizations/:id/reject - Reject organization (Super Admin only)
router.patch(
  "/:id/reject",
  authenticateJWT,
  requireSuperAdmin,
  validateId,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = (req as any).user.userId;

      // Check if organization exists and is pending
      const orgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ? AND status = 'pending'
    `,
        [id]
      );

      if (orgResult.rows.length === 0) {
        return res.status(404).json({
          error: "Organization not found or not in pending status",
        });
      }

      // Reject organization
      await query(
        `
      UPDATE organizations 
      SET status = 'rejected', 
          rejected_by = ?, 
          rejected_at = NOW(),
          rejection_reason = ?
      WHERE id = ?
    `,
        [adminId, reason || "No reason provided", id]
      );

      // Get updated organization
      const updatedOrgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ?
    `,
        [id]
      );

      res.json({
        message: "Organization rejected successfully",
        organization: updatedOrgResult.rows[0],
      });
    } catch (error) {
      console.error("Reject organization error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// PATCH /api/organizations/:id/suspend - Suspend organization (Super Admin only)
router.patch(
  "/:id/suspend",
  authenticateJWT,
  requireSuperAdmin,
  validateId,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = (req as any).user.userId;

      // Check if organization exists and is approved
      const orgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ? AND status = 'approved'
    `,
        [id]
      );

      if (orgResult.rows.length === 0) {
        return res.status(404).json({
          error: "Organization not found or not in approved status",
        });
      }

      // Suspend organization
      await query(
        `
      UPDATE organizations 
      SET status = 'suspended', 
          rejected_by = ?, 
          rejected_at = NOW(),
          rejection_reason = ?
      WHERE id = ?
    `,
        [adminId, reason || "No reason provided", id]
      );

      // Get updated organization
      const updatedOrgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ?
    `,
        [id]
      );

      res.json({
        message: "Organization suspended successfully",
        organization: updatedOrgResult.rows[0],
      });
    } catch (error) {
      console.error("Suspend organization error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// PATCH /api/organizations/:id/reactivate - Reactivate organization (Super Admin only)
router.patch(
  "/:id/reactivate",
  authenticateJWT,
  requireSuperAdmin,
  validateId,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminId = (req as any).user.userId;

      // Check if organization exists and is suspended
      const orgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ? AND status = 'suspended'
    `,
        [id]
      );

      if (orgResult.rows.length === 0) {
        return res.status(404).json({
          error: "Organization not found or not in suspended status",
        });
      }

      // Reactivate organization (set back to approved)
      await query(
        `
      UPDATE organizations 
      SET status = 'approved', 
          approved_by = ?, 
          approved_at = NOW(),
          rejected_by = NULL,
          rejected_at = NULL,
          rejection_reason = NULL
      WHERE id = ?
    `,
        [adminId, id]
      );

      // Get updated organization
      const updatedOrgResult = await query(
        `
      SELECT * FROM organizations WHERE id = ?
    `,
        [id]
      );

      res.json({
        message: "Organization reactivated successfully",
        organization: updatedOrgResult.rows[0],
      });
    } catch (error) {
      console.error("Reactivate organization error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /api/organizations/stats - Get overall organizations statistics (Super Admin only)
router.get(
  "/stats/overview",
  authenticateJWT,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const statsResult = await query(`
      SELECT 
        COUNT(*) as total_organizations,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_count,
        SUM(CASE WHEN subscription_plan = 'basic' THEN 1 ELSE 0 END) as basic_plan_count,
        SUM(CASE WHEN subscription_plan = 'premium' THEN 1 ELSE 0 END) as premium_plan_count,
        SUM(CASE WHEN subscription_plan = 'enterprise' THEN 1 ELSE 0 END) as enterprise_plan_count
      FROM organizations
    `);

      const userStatsResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(DISTINCT organization_id) as organizations_with_users
      FROM users 
      WHERE organization_id IS NOT NULL
    `);

      res.json({
        organization_stats: statsResult.rows[0],
        user_stats: userStatsResult.rows[0],
      });
    } catch (error) {
      console.error("Get organizations overview stats error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

export default router;
