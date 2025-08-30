import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { validatePagination, validateId } from '../middleware/validation.js';
import { requireTeacherOrAdmin } from '../middleware/auth.js';

const router = Router();

// Get all enrollments
router.get('/', validatePagination, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(studentId ? { studentId: parseInt(String(studentId)) } : {}),
      ...(courseId ? { courseId: parseInt(String(courseId)) } : {})
    };

    const enrollments = await prisma.enrollment.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, name: true, code: true } }
      },
      orderBy: { enrollmentDate: 'desc' }
    });

    const total = await prisma.enrollment.count({ where });

    res.json({
      data: enrollments,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Internal server error while fetching enrollments' });
  }
});

// Create enrollment
router.post('/', requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId, courseId } = req.body;

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: parseInt(String(studentId)),
        courseId: parseInt(String(courseId)),
        status: 'active'
      }
    });

    res.status(201).json({
      message: 'Enrollment created successfully',
      enrollment
    });

  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({ error: 'Internal server error while creating enrollment' });
  }
});

export default router;
