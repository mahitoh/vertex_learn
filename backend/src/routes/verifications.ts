import { Router, Request, Response } from "express";
import { query } from "../config/database.js";
import { requireAdmin } from "../middleware/auth.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// Get verification statistics
router.get(
  "/stats/overview",
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Get total users count
      const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
      const totalVerifications = totalUsersResult.rows[0].count;

      // Get pending verifications (users with validation_status = 'pending')
      const pendingResult = await query('SELECT COUNT(*) as count FROM users WHERE validation_status = ?', ['pending']);
      const pendingVerifications = pendingResult.rows[0].count;

      // Get verified count (users with validation_status = 'approved')
      const verifiedResult = await query('SELECT COUNT(*) as count FROM users WHERE validation_status = ?', ['approved']);
      const verifiedCount = verifiedResult.rows[0].count;

      // Get rejected count
      const rejectedResult = await query('SELECT COUNT(*) as count FROM users WHERE validation_status = ?', ['rejected']);
      const rejectedCount = rejectedResult.rows[0].count;

      // Get verifications by role
      const roleStatsResult = await query(`
        SELECT r.name as role, COUNT(u.id) as count 
        FROM roles r 
        LEFT JOIN users u ON r.id = u.role_id 
        GROUP BY r.id, r.name
      `);

      // Get recent users (acting as verifications)
      const recentUsersResult = await query(`
        SELECT u.id, u.name, u.email, u.validation_status, u.created_at, r.name as role_name
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.validation_status = 'pending'
        ORDER BY u.created_at DESC 
        LIMIT 5
      `);

      res.json({
        totalVerifications,
        pendingVerifications,
        verifiedCount,
        rejectedCount,
        verificationsByRole: roleStatsResult.rows,
        recentVerifications: recentUsersResult.rows,
      });
    } catch (error) {
      console.error("Get verification stats error:", error);
      res.status(500).json({
        error: "Internal server error while fetching verification statistics",
      });
    }
  }
);

// Get all verifications with pagination and filters
router.get(
  "/",
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { search, role, status = 'pending', page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build WHERE clause
      let whereClause = 'WHERE u.validation_status = ?';
      let params: any[] = [status];

      if (search) {
        whereClause += ' AND (u.name LIKE ? OR u.email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (role) {
        whereClause += ' AND r.name = ?';
        params.push(role);
      }

      // Get users (acting as verifications)
      const usersQuery = `
        SELECT 
          u.id, u.name, u.email, u.employee_id, u.department, 
          u.validation_status, u.created_at, u.updated_at,
          r.name as role_name, r.description as role_description
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        ${whereClause}
        ORDER BY u.created_at DESC 
        LIMIT ? OFFSET ?
      `;

      const usersResult = await query(usersQuery, [...params, parseInt(limit as string), offset]);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        ${whereClause}
      `;
      const countResult = await query(countQuery, params);
      const total = countResult.rows[0].total;

      // Format data to match expected structure
      const verifications = usersResult.rows.map((user: any) => ({
        id: user.id,
        role: user.role_name,
        status: user.validation_status,
        submissionDate: user.created_at,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          employeeId: user.employee_id,
          department: user.department
        }
      }));

      res.json({
        data: verifications,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      });
    } catch (error) {
      console.error("Get verifications error:", error);
      res.status(500).json({
        error: "Internal server error while fetching verifications",
      });
    }
  }
);

// Approve verification
router.post(
  "/approve/:id",
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
        return res.status(400).json({
          errors: [
            {
              field: "id",
              message: "ID must be a positive integer",
              value: id,
            },
          ],
        });
      }
      const { comments } = req.body;
      const adminId = req.user!.id;

      // Check if user exists and is pending
      const userResult = await query('SELECT * FROM users WHERE id = ?', [parseInt(id)]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const user = userResult.rows[0];

      if (user.validation_status !== "pending") {
        return res.status(400).json({
          error: "User is not in pending status",
        });
      }

      // Update user validation status
      await query(
        'UPDATE users SET validation_status = ?, validated_by = ?, validated_at = NOW() WHERE id = ?',
        ['approved', adminId, parseInt(id)]
      );

      // Get updated user info
      const updatedUserResult = await query(`
        SELECT u.*, r.name as role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.id = ?
      `, [parseInt(id)]);

      res.json({
        message: "User verification approved successfully",
        user: updatedUserResult.rows[0],
      });
    } catch (error) {
      console.error("Approve verification error:", error);
      res.status(500).json({
        error: "Internal server error while approving verification",
      });
    }
  }
);

// Reject verification
router.post(
  "/reject/:id",
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
        return res.status(400).json({
          errors: [
            {
              field: "id",
              message: "ID must be a positive integer",
              value: id,
            },
          ],
        });
      }
      const { comments } = req.body;
      const adminId = req.user!.id;

      // Check if user exists and is pending
      const userResult = await query('SELECT * FROM users WHERE id = ?', [parseInt(id)]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const user = userResult.rows[0];

      if (user.validation_status !== "pending") {
        return res.status(400).json({
          error: "User is not in pending status",
        });
      }

      if (!comments) {
        return res.status(400).json({
          error: "Comments are required when rejecting a verification",
        });
      }

      // Update user validation status
      await query(
        'UPDATE users SET validation_status = ?, validated_by = ?, validated_at = NOW() WHERE id = ?',
        ['rejected', adminId, parseInt(id)]
      );

      // Get updated user info
      const updatedUserResult = await query(`
        SELECT u.*, r.name as role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.id = ?
      `, [parseInt(id)]);

      res.json({
        message: "User verification rejected successfully",
        user: updatedUserResult.rows[0],
        comments: comments,
      });
    } catch (error) {
      console.error("Reject verification error:", error);
      res.status(500).json({
        error: "Internal server error while rejecting verification",
      });
    }
  }
);

export default router;