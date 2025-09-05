import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { validatePagination, validateId } from '../middleware/validation.js';

const router = Router();

// GET /api/admin/pending-users - Get users pending validation
router.get('/pending-users', authenticateJWT, requireAdmin, validatePagination, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get pending users with role information
    const usersResult = await query(`
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.validation_status = 'pending'
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [Number(limit), offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE validation_status = 'pending'
    `);

    const total = countResult.rows[0].total;

    res.json({
      users: usersResult.rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /api/admin/users - Get all users with filters
router.get('/users', authenticateJWT, requireAdmin, validatePagination, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND u.validation_status = ?';
      params.push(status);
    }

    if (role) {
      whereClause += ' AND r.name = ?';
      params.push(role);
    }

    // Get users with role information
    const usersResult = await query(`
      SELECT u.*, r.name as role_name, r.description as role_description,
             v.name as validated_by_name
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      LEFT JOIN users v ON u.validated_by = v.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id 
      ${whereClause}
    `, params);

    const total = countResult.rows[0].total;

    res.json({
      users: usersResult.rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PATCH /api/admin/users/:id/validate - Validate a user (approve/reject)
router.patch('/users/:id/validate', authenticateJWT, requireAdmin, validateId, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = (req as any).user.userId;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be either "approved" or "rejected"'
      });
    }

    // Check if user exists and is pending
    const userResult = await query(`
      SELECT * FROM users WHERE id = ? AND validation_status = 'pending'
    `, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found or not in pending status'
      });
    }

    // Update user validation status
    await query(`
      UPDATE users 
      SET validation_status = ?, validated_by = ?, validated_at = NOW()
      WHERE id = ?
    `, [status, adminId, id]);

    // Get updated user
    const updatedUserResult = await query(`
      SELECT u.*, r.name as role_name, r.description as role_description,
             v.name as validated_by_name
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      LEFT JOIN users v ON u.validated_by = v.id
      WHERE u.id = ?
    `, [id]);

    res.json({
      message: `User ${status} successfully`,
      user: updatedUserResult.rows[0]
    });

  } catch (error) {
    console.error('Validate user error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /api/admin/validation-stats - Get validation statistics
router.get('/validation-stats', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const statsResult = await query(`
      SELECT 
        validation_status,
        COUNT(*) as count
      FROM users 
      GROUP BY validation_status
    `);

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    statsResult.rows.forEach((row: any) => {
      stats[row.validation_status as keyof typeof stats] = row.count;
    });

    res.json(stats);

  } catch (error) {
    console.error('Get validation stats error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;