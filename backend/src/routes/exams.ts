import { Router } from 'express';
import { prisma } from '../config/database.js';
import { validatePagination, validateId } from '../middleware/validation.js';
import { requireTeacherOrAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Request, Response } from 'express';

const router = Router();

// Get all exams
router.get('/', validatePagination, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { courseId, isPublished, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(courseId ? { courseId: parseInt(String(courseId)) } : {}),
      ...(isPublished !== undefined ? { isPublished: isPublished === 'true' } : {})
    };

    const exams = await prisma.exam.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { examDate: 'desc' }
    });

    const total = await prisma.exam.count({ where });

    res.json({
      data: exams,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching exams'
    });
  }
});

// Create exam
router.post('/', requireTeacherOrAdmin, async (req, res) => {
  try {
    const { courseId, title, description, examDate, duration, totalMarks, location } = req.body;

    const exam = await prisma.exam.create({
      data: {
        courseId,
        title,
        description,
        examDate: new Date(examDate),
        duration,
        totalMarks,
        location,
        isPublished: false
      },
      include: {
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
      message: 'Exam created successfully',
      exam
    });

  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({
      error: 'Internal server error while creating exam'
    });
  }
});

export default router;

