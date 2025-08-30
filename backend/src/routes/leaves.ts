import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { validateLeave, validatePagination, validateId } from '../middleware/validation.js';
import { requireStaffOrAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all leaves with pagination and filters
router.get('/', validatePagination, requireStaffOrAdmin, async (req: Request, res: Response) => {
  try {
    const { employeeId, status, leaveType, startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(employeeId ? { employeeId: parseInt(String(employeeId)) } : {}),
      ...(status ? { status: { equals: String(status), mode: 'insensitive' } } : {}),
      ...(leaveType ? { leaveType: { equals: String(leaveType), mode: 'insensitive' } } : {}),
      ...(startDate ? { startDate: { gte: new Date(String(startDate)) } } : {}),
      ...(endDate ? { endDate: { lte: new Date(String(endDate)) } } : {})
    };

    const leaves = await prisma.leave.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.leave.count({ where });

    res.json({
      data: leaves,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching leaves'
    });
  }
});

// Create leave request
router.post('/', validateLeave, async (req: Request, res: Response) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason, description } = req.body;

    const leave = await prisma.leave.create({
      data: {
        employeeId: parseInt(String(employeeId)),
        leaveType: String(leaveType),
        startDate: new Date(String(startDate)),
        endDate: new Date(String(endDate)),
        reason: String(reason),
        description: description || null,
        status: 'pending'
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Leave request created successfully',
      leave
    });

  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({
      error: 'Internal server error while creating leave request'
    });
  }
});

// Approve/Reject leave request
router.post('/:id/approve', validateId, requireStaffOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const { status, comments } = req.body;
    const adminId = (req as any).user.id;

    // Check if leave exists
    const leave = await prisma.leave.findUnique({
      where: { id: parseInt(String(id)) },
      include: { employee: true }
    });

    if (!leave) {
      return res.status(404).json({
        error: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        error: 'Leave request is not in pending status'
      });
    }

    // Update leave status
    const updatedLeave = await prisma.leave.update({
      where: { id: parseInt(String(id)) },
      data: {
        status: String(status),
        comments: comments || null,
        approvedBy: adminId,
        approvedAt: new Date()
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: `Leave request ${status} successfully`,
      leave: updatedLeave
    });

  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({
      error: 'Internal server error while processing leave request'
    });
  }
});

export default router;

