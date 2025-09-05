import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Bulk import users
router.post('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { users } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Users array is required and must not be empty' });
    }

    const results = await Promise.allSettled(
      users.map(async (userData: any) => {
        return await query(
          `INSERT INTO users (
            email, password, first_name, last_name, name, role_id, employee_id, 
            student_id, department, position, join_date, admission_date, 
            class, roll_number, organization, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userData.email,
            userData.password || 'defaultPassword123',
            userData.firstName,
            userData.lastName,
            `${userData.firstName} ${userData.lastName}`,
            userData.roleId || 1,
            userData.employeeId || null,
            userData.studentId || null,
            userData.department || null,
            userData.position || null,
            userData.joinDate ? new Date(userData.joinDate) : null,
            userData.admissionDate ? new Date(userData.admissionDate) : null,
            userData.class || null,
            userData.rollNumber || null,
            userData.organization || null
          ]
        );
      })
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    res.json({
      message: `Bulk import completed. ${successful} users imported successfully, ${failed} failed.`,
      total: users.length,
      successful,
      failed
    });

  } catch (error) {
    console.error('Bulk users import error:', error);
    res.status(500).json({ error: 'Internal server error while importing users' });
  }
});

// Bulk import courses
router.post('/courses', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { courses } = req.body;
    
    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ error: 'Courses array is required and must not be empty' });
    }

    const results = await Promise.allSettled(
      courses.map(async (courseData: any) => {
        return await query(
          `INSERT INTO courses (name, code, credits, description, instructor_id, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            courseData.name,
            courseData.code,
            courseData.credits,
            courseData.description || null,
            courseData.instructorId || null,
            courseData.isActive !== undefined ? courseData.isActive : true
          ]
        );
      })
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    res.json({
      message: `Bulk import completed. ${successful} courses imported successfully, ${failed} failed.`,
      total: courses.length,
      successful,
      failed
    });

  } catch (error) {
    console.error('Bulk courses import error:', error);
    res.status(500).json({ error: 'Internal server error while importing courses' });
  }
});

// Bulk update user status
router.put('/users/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userIds, isActive } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required and must not be empty' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    const placeholders = userIds.map(() => '?').join(',');
    const result = await query(
      `UPDATE users SET is_active = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [isActive, ...userIds.map((id: any) => parseInt(String(id)))]
    );

    res.json({
      message: `Status updated for ${result.rows.affectedRows} users`,
      updatedCount: result.rows.affectedRows
    });

  } catch (error) {
    console.error('Bulk user status update error:', error);
    res.status(500).json({ error: 'Internal server error while updating user status' });
  }
});

// Bulk delete users
router.delete('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required and must not be empty' });
    }

    const placeholders = userIds.map(() => '?').join(',');
    const result = await query(
      `DELETE FROM users WHERE id IN (${placeholders})`,
      userIds.map((id: any) => parseInt(String(id)))
    );

    res.json({
      message: `${result.rows.affectedRows} users deleted successfully`,
      deletedCount: result.rows.affectedRows
    });

  } catch (error) {
    console.error('Bulk user deletion error:', error);
    res.status(500).json({ error: 'Internal server error while deleting users' });
  }
});

// Bulk import grades
router.post('/grades', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { grades } = req.body;
    
    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ error: 'Grades array is required and must not be empty' });
    }

    const results = await Promise.allSettled(
      grades.map(async (gradeData: any) => {
        const percentage = (gradeData.score / gradeData.maxScore) * 100;
        
        return await query(
          `INSERT INTO grades (student_id, course_id, assignment_type, score, max_score, percentage, comments, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            parseInt(String(gradeData.studentId)),
            parseInt(String(gradeData.courseId)),
            gradeData.assignmentType,
            parseFloat(String(gradeData.score)),
            parseFloat(String(gradeData.maxScore)),
            percentage,
            gradeData.comments || null
          ]
        );
      })
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    res.json({
      message: `Bulk import completed. ${successful} grades imported successfully, ${failed} failed.`,
      total: grades.length,
      successful,
      failed
    });

  } catch (error) {
    console.error('Bulk grades import error:', error);
    res.status(500).json({ error: 'Internal server error while importing grades' });
  }
});

export default router;
