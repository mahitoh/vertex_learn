import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get academic overview report
router.get('/academic/overview', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [studentsResult, coursesResult, teachersResult, examsResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = ?', ['student']),
      query('SELECT COUNT(*) as count FROM courses WHERE is_active = 1'),
      query('SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = ?', ['teacher']),
      query('SELECT COUNT(*) as count FROM exams')
    ]);

    const courseStatsResult = await query(
      'SELECT department, COUNT(*) as count FROM courses GROUP BY department'
    );

    const gradeStatsResult = await query(
      'SELECT course_id, AVG(percentage) as avg_percentage, COUNT(*) as count FROM grades GROUP BY course_id'
    );

    const totalStudents = (studentsResult.rows as any[])[0].count;
    const totalCourses = (coursesResult.rows as any[])[0].count;
    const totalTeachers = (teachersResult.rows as any[])[0].count;
    const totalExams = (examsResult.rows as any[])[0].count;

    res.json({
      overview: {
        totalStudents,
        totalCourses,
        totalTeachers,
        totalExams
      },
      courseStats: courseStatsResult.rows,
      gradeStats: gradeStatsResult.rows
    });

  } catch (error) {
    console.error('Academic overview error:', error);
    res.status(500).json({ error: 'Internal server error while generating academic report' });
  }
});

// Get financial overview report
router.get('/financial/overview', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [invoicesResult, paymentsResult, expensesResult, campaignsResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM invoices'),
      query('SELECT COUNT(*) as count FROM payments'),
      query('SELECT COUNT(*) as count FROM expenses'),
      query('SELECT COUNT(*) as count FROM campaigns')
    ]);

    const revenueStatsResult = await query(
      'SELECT SUM(amount) as total, AVG(amount) as average FROM payments'
    );

    const expenseStatsResult = await query(
      'SELECT SUM(amount) as total, AVG(amount) as average FROM expenses'
    );

    const campaignROIResult = await query(
      'SELECT name, SUM(roi) as total_roi, AVG(roi) as avg_roi FROM campaigns GROUP BY name'
    );

    const totalInvoices = (invoicesResult.rows as any[])[0].count;
    const totalPayments = (paymentsResult.rows as any[])[0].count;
    const totalExpenses = (expensesResult.rows as any[])[0].count;
    const totalCampaigns = (campaignsResult.rows as any[])[0].count;

    res.json({
      overview: {
        totalInvoices,
        totalPayments,
        totalExpenses,
        totalCampaigns
      },
      revenue: {
        total: (revenueStatsResult.rows as any[])[0].total || 0,
        average: (revenueStatsResult.rows as any[])[0].average || 0
      },
      expenses: {
        total: (expenseStatsResult.rows as any[])[0].total || 0,
        average: (expenseStatsResult.rows as any[])[0].average || 0
      },
      campaignROI: campaignROIResult.rows
    });

  } catch (error) {
    console.error('Financial overview error:', error);
    res.status(500).json({ error: 'Internal server error while generating financial report' });
  }
});

// Get HR overview report
router.get('/hr/overview', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [totalEmployees, totalLeaves, totalAssets, totalPerformance] = await Promise.all([
      prisma.user.count({ where: { role: { name: { in: ['teacher', 'staff'] } } } }),
      prisma.leave.count(),
      prisma.asset.count(),
      prisma.performance.count()
    ]);

    const leaveStats = await prisma.leave.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const assetStats = await prisma.asset.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const performanceStats = await prisma.performance.groupBy({
      by: ['period'],
      _avg: { score: true },
      _count: { id: true }
    });

    res.json({
      overview: {
        totalEmployees,
        totalLeaves,
        totalAssets,
        totalPerformance
      },
      leaveStats,
      assetStats,
      performanceStats
    });

  } catch (error) {
    console.error('HR overview error:', error);
    res.status(500).json({ error: 'Internal server error while generating HR report' });
  }
});

// Get student performance report
router.get('/student/:studentId/performance', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ error: 'Student ID is required' });

    const [grades, attendance, enrollments] = await Promise.all([
      prisma.grade.findMany({
        where: { studentId: parseInt(studentId) },
        include: { course: { select: { name: true, code: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.attendance.findMany({
        where: { studentId: parseInt(studentId) },
        include: { course: { select: { name: true, code: true } } }
      }),
      prisma.enrollment.findMany({
        where: { studentId: parseInt(studentId) },
        include: { course: { select: { name: true, code: true, credits: true } } }
      })
    ]);

    const attendancePercentage = attendance.length > 0 
      ? (attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100 
      : 0;

    const averageGrade = grades.length > 0 
      ? grades.reduce((sum: number, grade: any) => sum + grade.percentage, 0) / grades.length 
      : 0;

    res.json({
      studentId: parseInt(studentId),
      grades,
      attendance: {
        records: attendance,
        percentage: attendancePercentage
      },
      enrollments,
      summary: {
        totalCourses: enrollments.length,
        averageGrade,
        attendancePercentage
      }
    });

  } catch (error) {
    console.error('Student performance error:', error);
    res.status(500).json({ error: 'Internal server error while generating student report' });
  }
});

export default router;
