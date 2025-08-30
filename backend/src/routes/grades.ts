import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { validateGrade, validatePagination, validateId } from '../middleware/validation.js';
import { requireTeacherOrAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all grades with pagination and filters
router.get('/', validatePagination, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, assignmentType, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(studentId ? { studentId: parseInt(String(studentId)) } : {}),
      ...(courseId ? { courseId: parseInt(String(courseId)) } : {}),
      ...(assignmentType ? { assignmentType: { equals: String(assignmentType) } } : {})
    };

    const grades = await prisma.grade.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.grade.count({ where });

    res.json({
      data: grades,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching grades'
    });
  }
});

// Get grade by ID
router.get('/:id', validateId, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const grade = await prisma.grade.findUnique({
      where: { id: parseInt(String(id)) },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    if (!grade) {
      return res.status(404).json({
        error: 'Grade not found'
      });
    }

    res.json({ grade });

  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching grade'
    });
  }
});

// Create new grade
router.post('/', validateGrade, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, assignmentType, score, maxScore, comments } = req.body;

    // Check if grade already exists for this student, course, and assignment type
    const existingGrade = await prisma.grade.findFirst({
      where: {
        studentId: parseInt(String(studentId)),
        courseId: parseInt(String(courseId)),
        assignmentType: String(assignmentType)
      }
    });

    if (existingGrade) {
      return res.status(400).json({
        error: 'Grade already exists for this student, course, and assignment type'
      });
    }

    const grade = await prisma.grade.create({
      data: {
        studentId: parseInt(String(studentId)),
        courseId: parseInt(String(courseId)),
        assignmentType: String(assignmentType),
        score: parseInt(String(score)),
        maxScore: parseInt(String(maxScore)),
        comments: comments || null
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      message: 'Grade created successfully',
      grade
    });

  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({
      error: 'Internal server error while creating grade'
    });
  }
});

// Update grade
router.put('/:id', validateId, validateGrade, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const { score, maxScore, comments } = req.body;

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: parseInt(String(id)) }
    });

    if (!existingGrade) {
      return res.status(404).json({
        error: 'Grade not found'
      });
    }

    const grade = await prisma.grade.update({
      where: { id: parseInt(String(id)) },
      data: {
        ...(score && { score: parseInt(String(score)) }),
        ...(maxScore && { maxScore: parseInt(String(maxScore)) }),
        ...(comments !== undefined && { comments }),
        updatedAt: new Date()
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    res.json({
      message: 'Grade updated successfully',
      grade
    });

  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      error: 'Internal server error while updating grade'
    });
  }
});

// Delete grade
router.delete('/:id', validateId, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const grade = await prisma.grade.findUnique({
      where: { id: parseInt(String(id)) }
    });

    if (!grade) {
      return res.status(404).json({
        error: 'Grade not found'
      });
    }

    await prisma.grade.delete({
      where: { id: parseInt(String(id)) }
    });

    res.json({
      message: 'Grade deleted successfully'
    });

  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      error: 'Internal server error while deleting grade'
    });
  }
});

// Get grades by student
router.get('/student/:studentId', validateId, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ error: 'Student ID is required' });

    const grades = await prisma.grade.findMany({
      where: { studentId: parseInt(String(studentId)) },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      grades
    });

  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching student grades'
    });
  }
});

// Get grades by course
router.get('/course/:courseId', validateId, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ error: 'Course ID is required' });

    const grades = await prisma.grade.findMany({
      where: { courseId: parseInt(String(courseId)) },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      grades
    });

  } catch (error) {
    console.error('Get course grades error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching course grades'
    });
  }
});

// Get grade statistics
router.get('/stats/overview', requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const totalGrades = await prisma.grade.count();
    const averageScore = await prisma.grade.aggregate({
      _avg: { score: true }
    });

    const gradesByType = await prisma.grade.groupBy({
      by: ['assignmentType'],
      _count: { id: true },
      _avg: { score: true }
    });

    const recentGrades = await prisma.grade.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        course: {
          select: {
            name: true
          }
        }
      }
    });

    res.json({
      totalGrades,
      averageScore: averageScore._avg.score || 0,
      gradesByType,
      recentGrades
    });

  } catch (error) {
    console.error('Get grade stats error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching grade statistics'
    });
  }
});

export default router;

