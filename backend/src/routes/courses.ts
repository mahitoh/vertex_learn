import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { validateCourse, validatePagination, validateId } from '../middleware/validation.js';
import { requireTeacherOrAdmin, requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all courses with pagination and filters
router.get('/', validatePagination, async (req: Request, res: Response) => {
  try {
    const { search, instructorId, isActive, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    let whereClause = 'WHERE 1=1';
    const values = [];
    
    if (search) {
      whereClause += ' AND (c.name LIKE ? OR c.code LIKE ? OR c.description LIKE ?)';
      const searchTerm = `%${search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }
    if (instructorId) {
      whereClause += ' AND c.instructor_id = ?';
      values.push(parseInt(String(instructorId)));
    }
    if (isActive !== undefined) {
      whereClause += ' AND c.is_active = ?';
      values.push(isActive === 'true');
    }

    const coursesResult = await query(`
      SELECT c.*, 
             u.name as instructor_name, u.email as instructor_email,
             COUNT(e.id) as student_count,
             COUNT(g.id) as grade_count
      FROM courses c 
      LEFT JOIN users u ON c.instructor_id = u.id 
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      LEFT JOIN grades g ON c.id = g.course_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC 
      LIMIT ? OFFSET ?
    `, [...values, parseInt(String(limit)), offset]);

    const totalResult = await query(`
      SELECT COUNT(*) as total FROM courses c ${whereClause}
    `, values);

    res.json({
      data: coursesResult.rows,
      total: totalResult.rows[0].total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(totalResult.rows[0].total / parseInt(String(limit)))
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

    const courseResult = await query(`
      SELECT c.*, u.name as instructor_name, u.email as instructor_email
      FROM courses c 
      LEFT JOIN users u ON c.instructor_id = u.id 
      WHERE c.id = ?
    `, [parseInt(String(id))]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    const course = courseResult.rows[0];

    // Get students enrolled in this course
    const studentsResult = await query(`
      SELECT u.id, u.name, u.email
      FROM enrollments e 
      JOIN users u ON e.student_id = u.id 
      WHERE e.course_id = ? AND e.status = 'active'
    `, [parseInt(String(id))]);

    // Get grades for this course
    const gradesResult = await query(`
      SELECT g.*, u.name as student_name
      FROM grades g 
      JOIN users u ON g.student_id = u.id 
      WHERE g.course_id = ?
      ORDER BY g.created_at DESC
    `, [parseInt(String(id))]);

    // Get counts
    const countsResult = await query(`
      SELECT 
        COUNT(DISTINCT e.student_id) as student_count,
        COUNT(g.id) as grade_count
      FROM courses c 
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      LEFT JOIN grades g ON c.id = g.course_id
      WHERE c.id = ?
    `, [parseInt(String(id))]);

    res.json({ 
      course: {
        ...course,
        students: studentsResult.rows,
        grades: gradesResult.rows,
        _count: countsResult.rows[0]
      }
    });

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
    const existingCourseResult = await query(
      'SELECT id FROM courses WHERE code = ?',
      [String(code)]
    );

    if (existingCourseResult.rows.length > 0) {
      return res.status(400).json({
        error: 'Course with this code already exists'
      });
    }

    const courseResult = await query(`
      INSERT INTO courses (name, code, credits, description, instructor_id, is_active, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())
    `, [name, String(code), parseInt(String(credits)), description, parseInt(String(instructorId))]);

    const newCourseResult = await query(`
      SELECT c.*, u.name as instructor_name, u.email as instructor_email
      FROM courses c 
      LEFT JOIN users u ON c.instructor_id = u.id 
      WHERE c.id = ?
    `, [courseResult.rows.insertId]);

    res.status(201).json({
      message: 'Course created successfully',
      course: newCourseResult.rows[0]
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
    const existingCourseResult = await query(
      'SELECT * FROM courses WHERE id = ?',
      [parseInt(String(id))]
    );

    if (existingCourseResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    const existingCourse = existingCourseResult.rows[0];

    // Check if new code conflicts with existing course
    if (code && code !== existingCourse.code) {
      const codeConflictResult = await query(
        'SELECT id FROM courses WHERE code = ? AND id != ?',
        [String(code), parseInt(String(id))]
      );

      if (codeConflictResult.rows.length > 0) {
        return res.status(400).json({
          error: 'Course with this code already exists'
        });
      }
    }

    // Build update query
    const updateFields = [];
    const values = [];
    
    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (code) {
      updateFields.push('code = ?');
      values.push(String(code));
    }
    if (credits) {
      updateFields.push('credits = ?');
      values.push(parseInt(String(credits)));
    }
    if (description) {
      updateFields.push('description = ?');
      values.push(description);
    }
    if (instructorId) {
      updateFields.push('instructor_id = ?');
      values.push(parseInt(String(instructorId)));
    }
    if (isActive !== undefined) {
      updateFields.push('is_active = ?');
      values.push(isActive);
    }
    
    updateFields.push('updated_at = NOW()');
    values.push(parseInt(String(id)));

    await query(
      `UPDATE courses SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    const updatedCourseResult = await query(`
      SELECT c.*, u.name as instructor_name, u.email as instructor_email
      FROM courses c 
      LEFT JOIN users u ON c.instructor_id = u.id 
      WHERE c.id = ?
    `, [parseInt(String(id))]);

    res.json({
      message: 'Course updated successfully',
      course: updatedCourseResult.rows[0]
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

    const courseResult = await query(
      'SELECT id FROM courses WHERE id = ?',
      [parseInt(String(id))]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    // Soft delete - set isActive to false
    await query(
      'UPDATE courses SET is_active = false, updated_at = NOW() WHERE id = ?',
      [parseInt(String(id))]
    );

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
    const [totalCoursesResult, activeCoursesResult, totalStudentsResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM courses WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM courses WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.is_active = true')
    ]);

    const coursesByDepartmentResult = await query(`
      SELECT department, COUNT(*) as count
      FROM courses 
      WHERE is_active = true 
      GROUP BY department
    `);

    const recentCoursesResult = await query(`
      SELECT c.*, u.name as instructor_name
      FROM courses c 
      LEFT JOIN users u ON c.instructor_id = u.id 
      WHERE c.is_active = true 
      ORDER BY c.created_at DESC 
      LIMIT 5
    `);

    res.json({
      totalCourses: totalCoursesResult.rows[0].count,
      activeCourses: activeCoursesResult.rows[0].count,
      totalStudents: totalStudentsResult.rows[0].count,
      coursesByDepartment: coursesByDepartmentResult.rows,
      recentCourses: recentCoursesResult.rows
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

    const coursesResult = await query(`
      SELECT c.*, 
             COUNT(e.id) as student_count,
             COUNT(g.id) as grade_count
      FROM courses c 
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      LEFT JOIN grades g ON c.id = g.course_id
      WHERE c.instructor_id = ? AND c.is_active = true
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [parseInt(String(instructorId))]);

    res.json({
      courses: coursesResult.rows
    });

  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching instructor courses'
    });
  }
});

export default router;

