import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
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

    let queryStr = `
      SELECT a.*, s.id as student_id, s.name as student_name, s.email as student_email,
             c.id as course_id, c.name as course_name, c.code as course_code
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.id
      LEFT JOIN courses c ON a.course_id = c.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (studentId) {
      queryStr += ' AND a.student_id = ?';
      queryParams.push(parseInt(String(studentId)));
    }
    if (courseId) {
      queryStr += ' AND a.course_id = ?';
      queryParams.push(parseInt(String(courseId)));
    }
    if (date) {
      queryStr += ' AND DATE(a.date) = DATE(?)';
      queryParams.push(String(date));
    }
    if (status) {
      queryStr += ' AND a.status = ?';
      queryParams.push(String(status));
    }

    queryStr += ' ORDER BY a.date DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(String(limit)), skip);

    const { rows: attendance } = await query(queryStr, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM attendance a WHERE 1=1';
    const countParams = [];

    if (studentId) {
      countQuery += ' AND a.student_id = ?';
      countParams.push(parseInt(String(studentId)));
    }
    if (courseId) {
      countQuery += ' AND a.course_id = ?';
      countParams.push(parseInt(String(courseId)));
    }
    if (date) {
      countQuery += ' AND DATE(a.date) = DATE(?)';
      countParams.push(String(date));
    }
    if (status) {
      countQuery += ' AND a.status = ?';
      countParams.push(String(status));
    }

    const { rows: [{ total }] } = await query(countQuery, countParams);

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

