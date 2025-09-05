import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { validatePagination, validateId } from '../middleware/validation.js';
import { requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all roles with pagination and filters
router.get('/', validatePagination, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(search ? {
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } }
        ]
      } : {})
    };

    // Build WHERE clause for search
    let whereClause = '';
    let queryParams = [];
    
    if (search) {
      whereClause = 'WHERE r.name LIKE ? OR r.description LIKE ?';
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    // Get roles with user count
    const rolesResult = await query(
      `SELECT r.*, COUNT(u.id) as user_count 
       FROM roles r 
       LEFT JOIN users u ON r.id = u.role_id 
       ${whereClause}
       GROUP BY r.id 
       ORDER BY r.name ASC 
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(String(limit)), skip]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(DISTINCT r.id) as total FROM roles r ${whereClause}`,
      queryParams
    );

    const roles = rolesResult.rows;
    const total = countResult.rows[0].total;

    res.json({
      data: roles,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching roles'
    });
  }
});

// Get role by ID
router.get('/:id', validateId, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    // Get role with users
    const roleResult = await query(
      'SELECT * FROM roles WHERE id = ?',
      [parseInt(String(id))]
    );
    
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const role = roleResult.rows[0];
    
    // Get users for this role
    const usersResult = await query(
      'SELECT id, first_name, last_name, email, department FROM users WHERE role_id = ?',
      [parseInt(String(id))]
    );
    
    role.users = usersResult.rows;
    role._count = { users: usersResult.rows.length };

    res.json({ role });

  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching role'
    });
  }
});

// Create new role
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name || !permissions) {
      return res.status(400).json({
        error: 'Name and permissions are required'
      });
    }

    // Check if role already exists
    const existingRoleResult = await query(
      'SELECT id FROM roles WHERE name = ?',
      [name]
    );

    if (existingRoleResult.rows.length > 0) {
      return res.status(400).json({
        error: 'Role with this name already exists'
      });
    }

    const createResult = await query(
      'INSERT INTO roles (name, permissions, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [name, JSON.stringify(permissions)]
    );
    
    const roleResult = await query(
      'SELECT * FROM roles WHERE id = ?',
      [createResult.rows.insertId]
    );
    
    const role = roleResult.rows[0];

    res.status(201).json({
      message: 'Role created successfully',
      role
    });

  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      error: 'Internal server error while creating role'
    });
  }
});

// Update role
router.put('/:id', validateId, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const { name, description, permissions, isActive } = req.body;

    // Check if role exists
    const existingRoleResult = await query(
      'SELECT * FROM roles WHERE id = ?',
      [parseInt(String(id))]
    );

    if (existingRoleResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Role not found'
      });
    }

    const existingRole = existingRoleResult.rows[0];

    // Check if new name conflicts with existing role
    if (name && name !== existingRole.name) {
      const nameConflictResult = await query(
        'SELECT id FROM roles WHERE name = ? AND id != ?',
        [String(name), parseInt(String(id))]
      );

      if (nameConflictResult.rows.length > 0) {
        return res.status(400).json({
          error: 'Role with this name already exists'
        });
      }
    }

    // Build update query
    let updateFields = [];
    let updateParams = [];
    
    if (name) {
      updateFields.push('name = ?');
      updateParams.push(String(name));
    }
    if (description) {
      updateFields.push('description = ?');
      updateParams.push(String(description));
    }
    if (permissions) {
      updateFields.push('permissions = ?');
      updateParams.push(JSON.stringify(permissions));
    }
    if (isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateParams.push(isActive);
    }
    
    updateFields.push('updated_at = NOW()');
    updateParams.push(parseInt(String(id)));

    await query(
      `UPDATE roles SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );
    
    // Get updated role with user count
    const roleResult = await query(
      `SELECT r.*, COUNT(u.id) as user_count 
       FROM roles r 
       LEFT JOIN users u ON r.id = u.role_id 
       WHERE r.id = ? 
       GROUP BY r.id`,
      [parseInt(String(id))]
    );
    
    const role = roleResult.rows[0];
    role._count = { users: role.user_count };

    res.json({
      message: 'Role updated successfully',
      role
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      error: 'Internal server error while updating role'
    });
  }
});

// Delete role
router.delete('/:id', validateId, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const roleResult = await query(
      `SELECT r.*, COUNT(u.id) as user_count 
       FROM roles r 
       LEFT JOIN users u ON r.id = u.role_id 
       WHERE r.id = ? 
       GROUP BY r.id`,
      [parseInt(String(id))]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Role not found'
      });
    }

    const role = roleResult.rows[0];

    // Check if role has users
    if (role.user_count > 0) {
      return res.status(400).json({
        error: 'Cannot delete role with assigned users'
      });
    }

    await query(
      'DELETE FROM roles WHERE id = ?',
      [parseInt(String(id))]
    );

    res.json({
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      error: 'Internal server error while deleting role'
    });
  }
});

export default router;

