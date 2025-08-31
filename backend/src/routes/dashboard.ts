import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// Get main dashboard data
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const [totalStudentsResult, totalTeachersResult, totalCoursesResult, totalRevenueResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = "student"'),
      query('SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = "teacher"'),
      query('SELECT COUNT(*) as count FROM courses WHERE is_active = true'),
      query('SELECT SUM(amount) as total FROM payments')
    ]);

    const recentActivitiesResult = await query(`
      SELECT n.*, 
             r.name as recipient_name,
             s.name as sender_name
      FROM notifications n 
      LEFT JOIN users r ON n.recipient_id = r.id 
      LEFT JOIN users s ON n.sender_id = s.id 
      ORDER BY n.created_at DESC 
      LIMIT 5
    `);

    const upcomingExamsResult = await query(`
      SELECT e.*, c.name as course_name, c.code as course_code
      FROM exams e 
      JOIN courses c ON e.course_id = c.id 
      WHERE e.exam_date >= NOW() AND e.is_published = true 
      ORDER BY e.exam_date ASC 
      LIMIT 5
    `);

    const pendingLeavesResult = await query('SELECT COUNT(*) as count FROM leaves WHERE status = "pending"');
    const pendingVerificationsResult = await query('SELECT COUNT(*) as count FROM verifications WHERE status = "pending"');

    res.json({
      overview: {
        totalStudents: totalStudentsResult.rows[0].count,
        totalTeachers: totalTeachersResult.rows[0].count,
        totalCourses: totalCoursesResult.rows[0].count,
        totalRevenue: totalRevenueResult.rows[0].total || 0
      },
      recentActivities: recentActivitiesResult.rows,
      upcomingExams: upcomingExamsResult.rows,
      pendingItems: {
        leaves: pendingLeavesResult.rows[0].count,
        verifications: pendingVerificationsResult.rows[0].count
      }
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error while fetching dashboard data' });
  }
});

// Get student dashboard data
router.get('/student', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    const [enrollmentsResult, gradesResult, attendanceResult, upcomingExamsResult] = await Promise.all([
      query(`
        SELECT e.*, c.name as course_name, c.code as course_code, c.credits
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.student_id = ? AND e.status = 'active'
      `, [userId]),
      query(`
        SELECT g.*, c.name as course_name, c.code as course_code
        FROM grades g 
        JOIN courses c ON g.course_id = c.id 
        WHERE g.student_id = ? 
        ORDER BY g.created_at DESC 
        LIMIT 10
      `, [userId]),
      query(`
        SELECT a.*, c.name as course_name, c.code as course_code
        FROM attendance a 
        JOIN courses c ON a.course_id = c.id 
        WHERE a.student_id = ? 
        ORDER BY a.date DESC 
        LIMIT 10
      `, [userId]),
      query(`
        SELECT e.*, c.name as course_name, c.code as course_code
        FROM exams e 
        JOIN courses c ON e.course_id = c.id 
        JOIN enrollments en ON c.id = en.course_id 
        WHERE e.exam_date >= NOW() AND e.is_published = true 
        AND en.student_id = ? AND en.status = 'active'
        ORDER BY e.exam_date ASC 
        LIMIT 5
      `, [userId])
    ]);

    const attendance = attendanceResult.rows;
    const grades = gradesResult.rows;

    const attendancePercentage = attendance.length > 0 
      ? (attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100 
      : 0;

    const averageGrade = grades.length > 0 
      ? grades.reduce((sum: number, grade: any) => sum + grade.percentage, 0) / grades.length 
      : 0;

    res.json({
      enrollments: enrollmentsResult.rows,
      grades,
      attendance,
      upcomingExams: upcomingExamsResult.rows,
      summary: {
        totalCourses: enrollmentsResult.rows.length,
        averageGrade,
        attendancePercentage
      }
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ error: 'Internal server error while fetching student dashboard' });
  }
});

// Get teacher dashboard data
router.get('/teacher', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    const [coursesResult, studentsResult, recentGradesResult, upcomingExamsResult] = await Promise.all([
      query(`
        SELECT c.*, COUNT(e.id) as enrollment_count
        FROM courses c 
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
        WHERE c.instructor_id = ? AND c.is_active = true
        GROUP BY c.id
      `, [userId]),
      query(`
        SELECT COUNT(*) as count 
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE c.instructor_id = ? AND e.status = 'active'
      `, [userId]),
      query(`
        SELECT g.*, s.name as student_name, c.name as course_name
        FROM grades g 
        JOIN students s ON g.student_id = s.id 
        JOIN courses c ON g.course_id = c.id 
        WHERE c.instructor_id = ? 
        ORDER BY g.created_at DESC 
        LIMIT 10
      `, [userId]),
      query(`
        SELECT e.*, c.name as course_name, c.code as course_code
        FROM exams e 
        JOIN courses c ON e.course_id = c.id 
        WHERE c.instructor_id = ? AND e.exam_date >= NOW()
        ORDER BY e.exam_date ASC 
        LIMIT 5
      `, [userId])
    ]);

    res.json({
      courses: coursesResult.rows,
      totalStudents: studentsResult.rows[0].count,
      recentGrades: recentGradesResult.rows,
      upcomingExams: upcomingExamsResult.rows
    });

  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ error: 'Internal server error while fetching teacher dashboard' });
  }
});

export default router;
