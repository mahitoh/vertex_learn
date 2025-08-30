import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { validatePagination, validateId } from '../middleware/validation.js';
import { requireTeacherOrAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all attendance records
router.get('/', validatePagination, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, date, status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(studentId ? { studentId: parseInt(String(studentId)) } : {}),
      ...(courseId ? { courseId: parseInt(String(courseId)) } : {}),
      ...(date ? { date: { equals: new Date(String(date)) } } : {}),
      ...(status ? { status: { equals: String(status) } } : {})
    };

    const attendance = await prisma.attendance.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    const total = await prisma.attendance.count({ where });

    res.json({
      data: attendance,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching attendance'
    });
  }
});

// Create attendance record
router.post('/', requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, date, status } = req.body;

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        courseId,
        date: new Date(date),
        status
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Attendance record created successfully',
      attendance
    });

  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({
      error: 'Internal server error while creating attendance record'
    });
  }
});

export default router;

