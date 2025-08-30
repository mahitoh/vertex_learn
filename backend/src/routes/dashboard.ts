import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// Get main dashboard data
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const [totalStudents, totalTeachers, totalCourses, totalRevenue] = await Promise.all([
      prisma.user.count({ where: { role: { name: 'student' } } }),
      prisma.user.count({ where: { role: { name: 'teacher' } } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.payment.aggregate({ _sum: { amount: true } })
    ]);

    const recentActivities = await prisma.notification.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        recipient: { select: { name: true } },
        sender: { select: { name: true } }
      }
    });

    const upcomingExams = await prisma.exam.findMany({
      where: { 
        examDate: { gte: new Date() },
        isPublished: true 
      },
      take: 5,
      orderBy: { examDate: 'asc' },
      include: { course: { select: { name: true, code: true } } }
    });

    const pendingLeaves = await prisma.leave.count({
      where: { status: 'pending' }
    });

    const pendingVerifications = await prisma.verification.count({
      where: { status: 'pending' }
    });

    res.json({
      overview: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalRevenue: totalRevenue._sum.amount || 0
      },
      recentActivities,
      upcomingExams,
      pendingItems: {
        leaves: pendingLeaves,
        verifications: pendingVerifications
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

    const [enrollments, grades, attendance, upcomingExams] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId: userId, status: 'active' },
        include: { course: { select: { name: true, code: true, credits: true } } }
      }),
      prisma.grade.findMany({
        where: { studentId: userId },
        include: { course: { select: { name: true, code: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.attendance.findMany({
        where: { studentId: userId },
        include: { course: { select: { name: true, code: true } } },
        orderBy: { date: 'desc' },
        take: 10
      }),
      prisma.exam.findMany({
        where: { 
          examDate: { gte: new Date() },
          isPublished: true,
          course: { enrollments: { some: { studentId: userId, status: 'active' } } }
        },
        include: { course: { select: { name: true, code: true } } },
        orderBy: { examDate: 'asc' },
        take: 5
      })
    ]);

    const attendancePercentage = attendance.length > 0 
      ? (attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100 
      : 0;

    const averageGrade = grades.length > 0 
      ? grades.reduce((sum: number, grade: any) => sum + grade.percentage, 0) / grades.length 
      : 0;

    res.json({
      enrollments,
      grades,
      attendance,
      upcomingExams,
      summary: {
        totalCourses: enrollments.length,
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

    const [courses, students, recentGrades, upcomingExams] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId: userId, isActive: true },
        include: { _count: { enrollments: true } }
      }),
      prisma.enrollment.count({
        where: { 
          course: { instructorId: userId },
          status: 'active'
        }
      }),
      prisma.grade.findMany({
        where: { course: { instructorId: userId } },
        include: { 
          student: { select: { name: true } },
          course: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.exam.findMany({
        where: { 
          course: { instructorId: userId },
          examDate: { gte: new Date() }
        },
        include: { course: { select: { name: true, code: true } } },
        orderBy: { examDate: 'asc' },
        take: 5
      })
    ]);

    res.json({
      courses,
      totalStudents: students,
      recentGrades,
      upcomingExams
    });

  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ error: 'Internal server error while fetching teacher dashboard' });
  }
});

export default router;
