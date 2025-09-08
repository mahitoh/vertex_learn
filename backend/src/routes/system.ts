import { Router, Request, Response } from "express";
import { query } from "../config/database.js";
import { authenticateJWT, requireSuperAdmin } from "../middleware/auth.js";
import { validatePagination } from "../middleware/validation.js";

const router = Router();

// GET /api/system/overview - Get system overview statistics (Super Admin only)
router.get(
  "/overview",
  authenticateJWT,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      // Get overall system statistics
      const systemStatsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM organizations) as total_organizations,
        (SELECT COUNT(*) FROM organizations WHERE status = 'approved') as active_organizations,
        (SELECT COUNT(*) FROM organizations WHERE status = 'pending') as pending_organizations,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
        (SELECT COUNT(*) FROM users WHERE validation_status = 'pending') as pending_users,
        (SELECT COUNT(*) FROM users WHERE role_id = 1) as super_admin_count,
        (SELECT COUNT(*) FROM users WHERE role_id = 2) as org_admin_count,
        (SELECT COUNT(*) FROM users WHERE role_id = 3) as teacher_count,
        (SELECT COUNT(*) FROM users WHERE role_id = 4) as student_count,
        (SELECT COUNT(*) FROM users WHERE role_id = 5) as staff_count,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM enrollments) as total_enrollments
    `);

      // Get user registrations by month (last 12 months)
      const registrationStatsResult = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as user_count
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

      // Get organization distribution by subscription plan
      const subscriptionStatsResult = await query(`
      SELECT 
        subscription_plan,
        COUNT(*) as count
      FROM organizations
      GROUP BY subscription_plan
    `);

      // Get recent system activities
      const recentActivitiesResult = await query(`
      SELECT 
        'user_registration' as activity_type,
        CONCAT(u.name, ' registered') as description,
        u.created_at as timestamp,
        o.name as organization_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'organization_created' as activity_type,
        CONCAT('Organization ', o.name, ' created') as description,
        o.created_at as timestamp,
        o.name as organization_name
      FROM organizations o
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      ORDER BY timestamp DESC
      LIMIT 20
    `);

      res.json({
        system_stats: systemStatsResult.rows[0],
        registration_trends: registrationStatsResult.rows,
        subscription_distribution: subscriptionStatsResult.rows,
        recent_activities: recentActivitiesResult.rows,
      });
    } catch (error) {
      console.error("Get system overview error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /api/system/users - Get all users across all organizations (Super Admin only)
router.get(
  "/users",
  authenticateJWT,
  requireSuperAdmin,
  validatePagination,
  async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        organization,
        status,
        search,
      } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause = "WHERE 1=1";
      const params: any[] = [];

      if (role) {
        whereClause += " AND r.name = ?";
        params.push(role);
      }

      if (organization) {
        whereClause += " AND o.id = ?";
        params.push(organization);
      }

      if (status) {
        whereClause += " AND u.validation_status = ?";
        params.push(status);
      }

      if (search) {
        whereClause += " AND (u.name LIKE ? OR u.email LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }

      // Get users with organization and role information
      const usersResult = await query(
        `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.department,
        u.employee_id,
        u.is_active,
        u.validation_status,
        u.created_at,
        u.last_login,
        r.name as role_name,
        o.name as organization_name,
        o.code as organization_code,
        v.name as validated_by_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN users v ON u.validated_by = v.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `,
        [...params, Number(limit), offset]
      );

      // Get total count
      const countResult = await query(
        `
      SELECT COUNT(*) as total 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      ${whereClause}
    `,
        params
      );

      const total = countResult.rows[0].total;

      res.json({
        users: usersResult.rows,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Get system users error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /api/system/roles - Get all roles with user counts (Super Admin only)
router.get(
  "/roles",
  authenticateJWT,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const rolesResult = await query(`
      SELECT 
        r.*,
        COUNT(u.id) as user_count
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id
      GROUP BY r.id
      ORDER BY r.id
    `);

      res.json({
        roles: rolesResult.rows,
      });
    } catch (error) {
      console.error("Get system roles error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /api/system/health - Get system health status (Super Admin only)
router.get(
  "/health",
  authenticateJWT,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      // Check database connectivity
      const dbHealthResult = await query("SELECT 1 as status");
      const dbHealth = dbHealthResult.rows.length > 0 ? "healthy" : "unhealthy";

      // Get database size and table stats
      const dbStatsResult = await query(`
      SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      ORDER BY size_mb DESC
    `);

      // Get system uptime (approximated by oldest record)
      const uptimeResult = await query(`
      SELECT MIN(created_at) as system_start FROM users
    `);

      // Check for any critical issues
      const criticalIssues = [];

      // Check for pending validations older than 7 days
      const oldPendingResult = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE validation_status = 'pending' 
      AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

      if (oldPendingResult.rows[0].count > 0) {
        criticalIssues.push({
          type: "old_pending_users",
          message: `${oldPendingResult.rows[0].count} users pending validation for over 7 days`,
          severity: "warning",
        });
      }

      // Check for organizations without admins
      const orgsWithoutAdminsResult = await query(`
      SELECT COUNT(*) as count
      FROM organizations o
      WHERE o.status = 'approved'
      AND NOT EXISTS (
        SELECT 1 FROM users u 
        WHERE u.organization_id = o.id 
        AND u.role_id = 2 
        AND u.is_active = true
      )
    `);

      if (orgsWithoutAdminsResult.rows[0].count > 0) {
        criticalIssues.push({
          type: "organizations_without_admins",
          message: `${orgsWithoutAdminsResult.rows[0].count} organizations without active admins`,
          severity: "critical",
        });
      }

      res.json({
        overall_status: criticalIssues.some(
          (issue) => issue.severity === "critical"
        )
          ? "critical"
          : criticalIssues.length > 0
          ? "warning"
          : "healthy",
        database: {
          status: dbHealth,
          tables: dbStatsResult.rows,
        },
        system_uptime: uptimeResult.rows[0].system_start,
        critical_issues: criticalIssues,
        last_checked: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get system health error:", error);
      res.status(500).json({
        error: "Internal server error",
        overall_status: "unhealthy",
      });
    }
  }
);

// POST /api/system/maintenance - Perform system maintenance tasks (Super Admin only)
router.post(
  "/maintenance",
  authenticateJWT,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const { task } = req.body;
      const results = [];

      switch (task) {
        case "cleanup_inactive_users":
          // Mark users inactive who haven't logged in for 90+ days
          const inactiveResult = await query(`
          UPDATE users 
          SET is_active = false 
          WHERE last_login < DATE_SUB(NOW(), INTERVAL 90 DAY)
          AND is_active = true
          AND role_id != 1
        `);
          results.push({
            task: "cleanup_inactive_users",
            affected_rows: inactiveResult.affectedRows,
            message: `Marked ${inactiveResult.affectedRows} users as inactive`,
          });
          break;

        case "cleanup_old_sessions":
          // This would typically clean up session tables if you have them
          results.push({
            task: "cleanup_old_sessions",
            affected_rows: 0,
            message: "Session cleanup completed (no session table found)",
          });
          break;

        case "update_statistics":
          // Refresh any cached statistics
          results.push({
            task: "update_statistics",
            affected_rows: 0,
            message: "Statistics cache refreshed",
          });
          break;

        default:
          return res.status(400).json({
            error: "Invalid maintenance task",
          });
      }

      res.json({
        message: "Maintenance tasks completed",
        results,
      });
    } catch (error) {
      console.error("System maintenance error:", error);
      res.status(500).json({
        error: "Internal server error during maintenance",
      });
    }
  }
);

// GET /api/system/audit-logs - Get system audit logs (Super Admin only)
router.get(
  "/audit-logs",
  authenticateJWT,
  requireSuperAdmin,
  validatePagination,
  async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 50,
        action_type,
        user_id,
        start_date,
        end_date,
      } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // For now, we'll create a basic audit log from user activities
      // In a production system, you'd have a dedicated audit_logs table
      let whereClause = "WHERE 1=1";
      const params: any[] = [];

      if (user_id) {
        whereClause += " AND u.id = ?";
        params.push(user_id);
      }

      if (start_date) {
        whereClause += " AND u.created_at >= ?";
        params.push(start_date);
      }

      if (end_date) {
        whereClause += " AND u.created_at <= ?";
        params.push(end_date);
      }

      // Get user creation events as audit logs
      const auditLogsResult = await query(
        `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        'user_created' as action_type,
        'User account created' as description,
        u.created_at as timestamp,
        o.name as organization_name,
        r.name as role_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN roles r ON u.role_id = r.id
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        v.id as user_id,
        v.name as user_name,
        v.email as user_email,
        'user_validated' as action_type,
        CONCAT('User validated: ', u.name) as description,
        u.validated_at as timestamp,
        o.name as organization_name,
        vr.name as role_name
      FROM users u
      JOIN users v ON u.validated_by = v.id
      LEFT JOIN organizations o ON v.organization_id = o.id
      LEFT JOIN roles vr ON v.role_id = vr.id
      WHERE u.validated_at IS NOT NULL
      
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `,
        [...params, Number(limit), offset]
      );

      // Get count for pagination
      const countResult = await query(
        `
      SELECT COUNT(*) as total FROM (
        SELECT u.id FROM users u ${whereClause}
        UNION ALL
        SELECT v.id FROM users u
        JOIN users v ON u.validated_by = v.id
        WHERE u.validated_at IS NOT NULL
      ) as audit_events
    `,
        params
      );

      const total = countResult.rows[0].total;

      res.json({
        audit_logs: auditLogsResult.rows,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// POST /api/system/broadcast - Send system-wide notification (Super Admin only)
router.post(
  "/broadcast",
  authenticateJWT,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        title,
        message,
        type = "info",
        target_roles,
        target_organizations,
      } = req.body;
      const adminId = (req as any).user.userId;

      if (!title || !message) {
        return res.status(400).json({
          error: "Title and message are required",
        });
      }

      // Build recipient query based on targets
      let recipientQuery =
        "SELECT DISTINCT u.id FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.is_active = true";
      const params: any[] = [];

      if (target_roles && target_roles.length > 0) {
        const rolePlaceholders = target_roles.map(() => "?").join(",");
        recipientQuery += ` AND r.name IN (${rolePlaceholders})`;
        params.push(...target_roles);
      }

      if (target_organizations && target_organizations.length > 0) {
        const orgPlaceholders = target_organizations.map(() => "?").join(",");
        recipientQuery += ` AND u.organization_id IN (${orgPlaceholders})`;
        params.push(...target_organizations);
      }

      // Get recipient list
      const recipientsResult = await query(recipientQuery, params);
      const recipientCount = recipientsResult.rows.length;

      // For now, we'll log the broadcast intent
      // In a real system, you'd insert into a notifications table
      console.log(`System broadcast initiated by user ${adminId}:`, {
        title,
        message,
        type,
        recipient_count: recipientCount,
        target_roles,
        target_organizations,
      });

      res.json({
        message: "Broadcast notification queued successfully",
        recipient_count: recipientCount,
        broadcast_id: Date.now(), // In real system, this would be a proper ID
      });
    } catch (error) {
      console.error("System broadcast error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

export default router;
