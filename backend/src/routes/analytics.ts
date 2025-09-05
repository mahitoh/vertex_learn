import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get academic analytics
router.get('/academic', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get enrollment trends
    const enrollmentTrendsResult = await query(
      `SELECT DATE(enrollment_date) as enrollmentDate, COUNT(*) as count 
       FROM enrollments 
       WHERE enrollment_date >= ? 
       GROUP BY DATE(enrollment_date) 
       ORDER BY enrollmentDate`,
      [thirtyDaysAgo]
    );

    // Get grade distribution
    const gradeDistributionResult = await query(
      `SELECT 
         CASE 
           WHEN percentage >= 90 THEN 'A'
           WHEN percentage >= 80 THEN 'B'
           WHEN percentage >= 70 THEN 'C'
           WHEN percentage >= 60 THEN 'D'
           ELSE 'F'
         END as grade,
         COUNT(*) as count
       FROM grades 
       GROUP BY 
         CASE 
           WHEN percentage >= 90 THEN 'A'
           WHEN percentage >= 80 THEN 'B'
           WHEN percentage >= 70 THEN 'C'
           WHEN percentage >= 60 THEN 'D'
           ELSE 'F'
         END`
    );

    // Get course popularity
    const coursePopularityResult = await query(
      `SELECT e.course_id as courseId, c.name, c.code, COUNT(*) as count
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       GROUP BY e.course_id, c.name, c.code
       ORDER BY count DESC
       LIMIT 10`
    );

    // Get attendance trends
    const attendanceTrendsResult = await query(
      `SELECT DATE(date) as date, status, COUNT(*) as count
       FROM attendance 
       WHERE date >= ?
       GROUP BY DATE(date), status
       ORDER BY date`,
      [thirtyDaysAgo]
    );

    res.json({
      enrollmentTrends: enrollmentTrendsResult.rows,
      gradeDistribution: gradeDistributionResult.rows,
      coursePopularity: coursePopularityResult.rows,
      attendanceTrends: attendanceTrendsResult.rows
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
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get revenue trends
    const revenueTrendsResult = await query(
      `SELECT DATE(payment_date) as paymentDate, SUM(amount) as totalAmount
       FROM payments 
       WHERE payment_date >= ?
       GROUP BY DATE(payment_date)
       ORDER BY paymentDate`,
      [thirtyDaysAgo]
    );

    // Get expense breakdown
    const expenseBreakdownResult = await query(
      `SELECT category, SUM(amount) as totalAmount, COUNT(*) as count
       FROM expenses 
       GROUP BY category`
    );

    // Get payment methods distribution
    const paymentMethodsResult = await query(
      `SELECT payment_method as paymentMethod, COUNT(*) as count, SUM(amount) as totalAmount
       FROM payments 
       GROUP BY payment_method`
    );

    // Get campaign performance
    const campaignPerformanceResult = await query(
      `SELECT name, budget, spent, leads, conversions, roi
       FROM campaigns 
       ORDER BY roi DESC`
    );

    res.json({
      revenueTrends: revenueTrendsResult.rows,
      expenseBreakdown: expenseBreakdownResult.rows,
      paymentMethods: paymentMethodsResult.rows,
      campaignPerformance: campaignPerformanceResult.rows
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
    const employeeDistributionResult = await query(
      `SELECT u.role_id as roleId, r.name as roleName, COUNT(*) as count
       FROM users u
       JOIN roles r ON u.role_id = r.id
       GROUP BY u.role_id, r.name`
    );

    // Get leave patterns
    const leavePatternsResult = await query(
      `SELECT type, status, COUNT(*) as count
       FROM leaves 
       GROUP BY type, status`
    );

    // Get asset utilization
    const assetUtilizationResult = await query(
      `SELECT status, COUNT(*) as count
       FROM assets 
       GROUP BY status`
    );

    res.json({
      employeeDistribution: employeeDistributionResult.rows,
      leavePatterns: leavePatternsResult.rows,
      performanceTrends: [], // Performance table might not exist yet
      assetUtilization: assetUtilizationResult.rows
    });

  } catch (error) {
    console.error('HR analytics error:', error);
    res.status(500).json({ error: 'Internal server error while fetching HR analytics' });
  }
});

// Get system health metrics
router.get('/system', requireAdmin, async (req: Request, res: Response) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Get user activity
    const userActivityResult = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM notifications 
       WHERE created_at >= ?
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [sevenDaysAgo]
    );

    // Get verification status
    const verificationStatusResult = await query(
      `SELECT status, COUNT(*) as count
       FROM verifications 
       GROUP BY status`
    );

    // Get notification types
    const notificationTypesResult = await query(
      `SELECT type, COUNT(*) as count
       FROM notifications 
       GROUP BY type`
    );

    res.json({
      userActivity: userActivityResult.rows,
      verificationStatus: verificationStatusResult.rows,
      notificationTypes: notificationTypesResult.rows
    });

  } catch (error) {
    console.error('System analytics error:', error);
    res.status(500).json({ error: 'Internal server error while fetching system analytics' });
  }
});

export default router;
