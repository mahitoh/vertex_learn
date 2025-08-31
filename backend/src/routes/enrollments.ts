import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
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

    let queryStr = `
      SELECT e.*, s.id as student_id, s.name as student_name, s.email as student_email,
             c.id as course_id, c.name as course_name, c.code as course_code
      FROM enrollments e
      LEFT JOIN students s ON e.student_id = s.id
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (studentId) {
      queryStr += ' AND e.student_id = ?';
      queryParams.push(parseInt(String(studentId)));
    }
    if (courseId) {
      queryStr += ' AND e.course_id = ?';
      queryParams.push(parseInt(String(courseId)));
    }

    queryStr += ' ORDER BY e.enrollment_date DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(String(limit)), skip);

    const { rows: enrollments } = await query(queryStr, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM enrollments e WHERE 1=1';
    const countParams = [];

    if (studentId) {
      countQuery += ' AND e.student_id = ?';
      countParams.push(parseInt(String(studentId)));
    }
    if (courseId) {
      countQuery += ' AND e.course_id = ?';
      countParams.push(parseInt(String(courseId)));
    }

    const { rows: [{ total }] } = await query(countQuery, countParams);

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

    const insertQuery = `
      INSERT INTO enrollments (student_id, course_id, status, enrollment_date)
      VALUES (?, ?, 'active', NOW())
    `;
    
    const { rows: [enrollment] } = await query(insertQuery, [
      parseInt(String(studentId)),
      parseInt(String(courseId))
    ]);

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
