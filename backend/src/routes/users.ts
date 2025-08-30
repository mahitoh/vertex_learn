import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { validateUserUpdate, validatePagination, validateId } from '../middleware/validation.js';
import { requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all users (employees) with pagination and filters
router.get('/', validatePagination, requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, department, role, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where = {
      isActive: true,
      ...(search ? {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { employeeId: { contains: search as string, mode: 'insensitive' } },
          { studentId: { contains: search as string, mode: 'insensitive' } }
        ]
      } : {}),
      ...(department ? { department: { contains: department as string, mode: 'insensitive' } } : {}),
      ...(role ? { role: { name: { equals: role as string, mode: 'insensitive' } } } : {})
    };

    const users = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit as string),
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        employeeId: true,
        studentId: true,
        department: true,
        position: true,
        joinDate: true,
        admissionDate: true,
        class: true,
        rollNumber: true,
        organization: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      data: users,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching users'
    });
  }
});

// Get user by ID
router.get('/:id', validateId, requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        employeeId: true,
        studentId: true,
        department: true,
        position: true,
        joinDate: true,
        admissionDate: true,
        class: true,
        rollNumber: true,
        organization: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching user'
    });
  }
});

// Create new user (employee)
router.post('/', validateUserUpdate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName, email, password, employeeId, studentId, department, position, joinDate, admissionDate, class: className, rollNumber, organization, roleId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(employeeId ? [{ employeeId }] : []),
          ...(studentId ? [{ studentId }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email, employee ID, or student ID already exists'
      });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      const bcrypt = require('bcrypt');
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        ...(hashedPassword && { password: hashedPassword }),
        employeeId,
        studentId,
        department,
        position,
        joinDate: joinDate ? new Date(joinDate) : null,
        admissionDate: admissionDate ? new Date(admissionDate) : null,
        class: className,
        rollNumber,
        organization,
        roleId: roleId || 3, // Default to student role
        isActive: true
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Internal server error while creating user'
    });
  }
});

// Update user
router.put('/:id', validateId, validateUserUpdate, requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, department, position, joinDate, admissionDate, class: className, rollNumber, organization, isActive } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(firstName && lastName && { name: `${firstName} ${lastName}` }),
      ...(department !== undefined && { department }),
      ...(position !== undefined && { position }),
      ...(joinDate !== undefined && { joinDate: joinDate ? new Date(joinDate) : null }),
      ...(admissionDate !== undefined && { admissionDate: admissionDate ? new Date(admissionDate) : null }),
      ...(className !== undefined && { class: className }),
      ...(rollNumber !== undefined && { rollNumber }),
      ...(organization !== undefined && { organization }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date()
    };

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      }
    });

    res.json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal server error while updating user'
    });
  }
});

// Soft delete user
router.delete('/:id', validateId, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Internal server error while deleting user'
    });
  }
});

// Get user statistics
router.get('/stats/overview', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({ where: { isActive: true } });
    const totalEmployees = await prisma.user.count({
      where: {
        isActive: true,
        employeeId: { not: null }
      }
    });
    const totalStudents = await prisma.user.count({
      where: {
        isActive: true,
        studentId: { not: null }
      }
    });

    const usersByRole = await prisma.user.groupBy({
      by: ['roleId'],
      where: { isActive: true },
      _count: { id: true }
    });

    const usersByDepartment = await prisma.user.groupBy({
      by: ['department'],
      where: { isActive: true, department: { not: null } },
      _count: { id: true }
    });

    res.json({
      totalUsers,
      totalEmployees,
      totalStudents,
      usersByRole,
      usersByDepartment
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching user statistics'
    });
  }
});

export default router;

