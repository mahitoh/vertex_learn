import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get academic overview report
router.get('/academic/overview', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [totalStudents, totalCourses, totalTeachers, totalExams] = await Promise.all([
      prisma.user.count({ where: { role: { name: 'student' } } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { name: 'teacher' } } }),
      prisma.exam.count()
    ]);

    const courseStats = await prisma.course.groupBy({
      by: ['department'],
      _count: { id: true }
    });

    const gradeStats = await prisma.grade.groupBy({
      by: ['courseId'],
      _avg: { percentage: true },
      _count: { id: true }
    });

    res.json({
      overview: {
        totalStudents,
        totalCourses,
        totalTeachers,
        totalExams
      },
      courseStats,
      gradeStats
    });

  } catch (error) {
    console.error('Academic overview error:', error);
    res.status(500).json({ error: 'Internal server error while generating academic report' });
  }
});

// Get financial overview report
router.get('/financial/overview', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [totalInvoices, totalPayments, totalExpenses, totalCampaigns] = await Promise.all([
      prisma.invoice.count(),
      prisma.payment.count(),
      prisma.expense.count(),
      prisma.campaign.count()
    ]);

    const revenueStats = await prisma.payment.aggregate({
      _sum: { amount: true },
      _avg: { amount: true }
    });

    const expenseStats = await prisma.expense.aggregate({
      _sum: { amount: true },
      _avg: { amount: true }
    });

    const campaignROI = await prisma.campaign.groupBy({
      by: ['name'],
      _sum: { roi: true },
      _avg: { roi: true }
    });

    res.json({
      overview: {
        totalInvoices,
        totalPayments,
        totalExpenses,
        totalCampaigns
      },
      revenue: {
        total: revenueStats._sum.amount || 0,
        average: revenueStats._avg.amount || 0
      },
      expenses: {
        total: expenseStats._sum.amount || 0,
        average: expenseStats._avg.amount || 0
      },
      campaignROI
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
