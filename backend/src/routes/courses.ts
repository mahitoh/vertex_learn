import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { validateCourse, validatePagination, validateId } from '../middleware/validation.js';
import { requireTeacherOrAdmin, requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all courses with pagination and filters
router.get('/', validatePagination, async (req: Request, res: Response) => {
  try {
    const { search, instructorId, isActive, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(search ? {
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { code: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } }
        ]
      } : {}),
      ...(instructorId ? { instructorId: parseInt(String(instructorId)) } : {}),
      ...(isActive !== undefined ? { isActive: isActive === 'true' } : {})
    };

    const courses = await prisma.course.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            students: true,
            grades: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.course.count({ where });

    res.json({
      data: courses,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching courses'
    });
  }
});

// Get course by ID
router.get('/:id', validateId, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const course = await prisma.course.findUnique({
      where: { id: parseInt(String(id)) },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        grades: {
          select: {
            id: true,
            score: true,
            maxScore: true,
            assignmentType: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            students: true,
            grades: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    res.json({ course });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching course'
    });
  }
});

// Create new course
router.post('/', validateCourse, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { name, code, credits, description, instructorId } = req.body;

    // Check if course code already exists
    const existingCourse = await prisma.course.findFirst({
      where: { code: String(code) }
    });

    if (existingCourse) {
      return res.status(400).json({
        error: 'Course with this code already exists'
      });
    }

    const course = await prisma.course.create({
      data: {
        name,
        code: String(code),
        credits: parseInt(String(credits)),
        description,
        instructorId: parseInt(String(instructorId)),
        isActive: true
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Course created successfully',
      course
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      error: 'Internal server error while creating course'
    });
  }
});

// Update course
router.put('/:id', validateId, validateCourse, requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const { name, code, credits, description, instructorId, isActive } = req.body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: parseInt(String(id)) }
    });

    if (!existingCourse) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    // Check if new code conflicts with existing course
    if (code && code !== existingCourse.code) {
      const codeConflict = await prisma.course.findFirst({
        where: { 
          code: String(code),
          id: { not: parseInt(String(id)) }
        }
      });

      if (codeConflict) {
        return res.status(400).json({
          error: 'Course with this code already exists'
        });
      }
    }

    const course = await prisma.course.update({
      where: { id: parseInt(String(id)) },
      data: {
        ...(name && { name }),
        ...(code && { code: String(code) }),
        ...(credits && { credits: parseInt(String(credits)) }),
        ...(description && { description }),
        ...(instructorId && { instructorId: parseInt(String(instructorId)) }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        instructor: {
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
      message: 'Course updated successfully',
      course
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      error: 'Internal server error while updating course'
    });
  }
});

// Delete course (soft delete)
router.delete('/:id', validateId, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const course = await prisma.course.findUnique({
      where: { id: parseInt(String(id)) }
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    // Soft delete - set isActive to false
    await prisma.course.update({
      where: { id: parseInt(String(id)) },
      data: { isActive: false }
    });

    res.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      error: 'Internal server error while deleting course'
    });
  }
});

// Get course statistics
router.get('/stats/overview', requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const totalCourses = await prisma.course.count({ where: { isActive: true } });
    const activeCourses = await prisma.course.count({ where: { isActive: true } });
    const totalStudents = await prisma.courseEnrollment.count({ where: { course: { isActive: true } } });

    const coursesByDepartment = await prisma.course.groupBy({
      by: ['department'],
      where: { isActive: true },
      _count: { id: true }
    });

    const recentCourses = await prisma.course.findMany({
      where: { isActive: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      totalCourses,
      activeCourses,
      totalStudents,
      coursesByDepartment,
      recentCourses
    });

  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching course statistics'
    });
  }
});

// Get courses by instructor
router.get('/instructor/:instructorId', validateId, async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;
    if (!instructorId) return res.status(400).json({ error: 'Instructor ID is required' });

    const courses = await prisma.course.findMany({
      where: { 
        instructorId: parseInt(String(instructorId)),
        isActive: true
      },
      include: {
        _count: {
          select: {
            students: true,
            grades: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      courses
    });

  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching instructor courses'
    });
  }
});

export default router;

