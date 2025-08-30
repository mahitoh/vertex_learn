import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
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

    const roles = await prisma.role.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const total = await prisma.role.count({ where });

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

    const role = await prisma.role.findUnique({
      where: { id: parseInt(String(id)) },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (!role) {
      return res.status(404).json({
        error: 'Role not found'
      });
    }

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
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return res.status(400).json({
        error: 'Role with this name already exists'
      });
    }

    const role = await prisma.role.create({
      data: {
        name,
        permissions
      }
    });

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
    const existingRole = await prisma.role.findUnique({
      where: { id: parseInt(String(id)) }
    });

    if (!existingRole) {
      return res.status(404).json({
        error: 'Role not found'
      });
    }

    // Check if new name conflicts with existing role
    if (name && name !== existingRole.name) {
      const nameConflict = await prisma.role.findFirst({
        where: { 
          name: String(name),
          id: { not: parseInt(String(id)) }
        }
      });

      if (nameConflict) {
        return res.status(400).json({
          error: 'Role with this name already exists'
        });
      }
    }

    const role = await prisma.role.update({
      where: { id: parseInt(String(id)) },
      data: {
        ...(name && { name: String(name) }),
        ...(description && { description: String(description) }),
        ...(permissions && { permissions }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

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

    const role = await prisma.role.findUnique({
      where: { id: parseInt(String(id)) },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (!role) {
      return res.status(404).json({
        error: 'Role not found'
      });
    }

    // Check if role has users
    if (role._count.users > 0) {
      return res.status(400).json({
        error: 'Cannot delete role with assigned users'
      });
    }

    await prisma.role.delete({
      where: { id: parseInt(String(id)) }
    });

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

