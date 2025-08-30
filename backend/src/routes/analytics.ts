import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get academic analytics
router.get('/academic', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    
    // Get enrollment trends
    const enrollmentTrends = await prisma.enrollment.groupBy({
      by: ['enrollmentDate'],
      _count: { id: true },
      where: {
        enrollmentDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    // Get grade distribution
    const gradeDistribution = await prisma.grade.groupBy({
      by: ['percentage'],
      _count: { id: true }
    });

    // Get course popularity
    const coursePopularity = await prisma.enrollment.groupBy({
      by: ['courseId'],
      _count: { id: true },
      include: {
        course: { select: { name: true, code: true } }
      },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    // Get attendance trends
    const attendanceTrends = await prisma.attendance.groupBy({
      by: ['date', 'status'],
      _count: { id: true },
      where: {
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      enrollmentTrends,
      gradeDistribution,
      coursePopularity,
      attendanceTrends
    });

  } catch (error) {
    console.error('Academic analytics error:', error);
    res.status(500).json({ error: 'Internal server error while fetching academic analytics' });
  }
});

// Get financial analytics
router.get('/financial', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    
    // Get revenue trends
    const revenueTrends = await prisma.payment.groupBy({
      by: ['paymentDate'],
      _sum: { amount: true },
      where: {
        paymentDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Get expense breakdown
    const expenseBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: { id: true }
    });

    // Get payment methods distribution
    const paymentMethods = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
      _sum: { amount: true }
    });

    // Get campaign performance
    const campaignPerformance = await prisma.campaign.findMany({
      select: {
        name: true,
        budget: true,
        spent: true,
        leads: true,
        conversions: true,
        roi: true
      },
      orderBy: { roi: 'desc' }
    });

    res.json({
      revenueTrends,
      expenseBreakdown,
      paymentMethods,
      campaignPerformance
    });

  } catch (error) {
    console.error('Financial analytics error:', error);
    res.status(500).json({ error: 'Internal server error while fetching financial analytics' });
  }
});

// Get HR analytics
router.get('/hr', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get employee distribution by role
    const employeeDistribution = await prisma.user.groupBy({
      by: ['roleId'],
      _count: { id: true },
      include: {
        role: { select: { name: true } }
      }
    });

    // Get leave patterns
    const leavePatterns = await prisma.leave.groupBy({
      by: ['type', 'status'],
      _count: { id: true }
    });

    // Get performance trends
    const performanceTrends = await prisma.performance.groupBy({
      by: ['period'],
      _avg: { score: true },
      _count: { id: true }
    });

    // Get asset utilization
    const assetUtilization = await prisma.asset.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.json({
      employeeDistribution,
      leavePatterns,
      performanceTrends,
      assetUtilization
    });

  } catch (error) {
    console.error('HR analytics error:', error);
    res.status(500).json({ error: 'Internal server error while fetching HR analytics' });
  }
});

// Get system health metrics
router.get('/system', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get user activity
    const userActivity = await prisma.notification.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    // Get verification status
    const verificationStatus = await prisma.verification.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // Get notification types
    const notificationTypes = await prisma.notification.groupBy({
      by: ['type'],
      _count: { id: true }
    });

    res.json({
      userActivity,
      verificationStatus,
      notificationTypes
    });

  } catch (error) {
    console.error('System analytics error:', error);
    res.status(500).json({ error: 'Internal server error while fetching system analytics' });
  }
});

export default router;
