import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
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
        return await prisma.user.create({
          data: {
            email: userData.email,
            password: userData.password || 'defaultPassword123',
            firstName: userData.firstName,
            lastName: userData.lastName,
            name: `${userData.firstName} ${userData.lastName}`,
            roleId: userData.roleId || 1,
            employeeId: userData.employeeId,
            studentId: userData.studentId,
            department: userData.department,
            position: userData.position,
            joinDate: userData.joinDate ? new Date(userData.joinDate) : null,
            admissionDate: userData.admissionDate ? new Date(userData.admissionDate) : null,
            class: userData.class,
            rollNumber: userData.rollNumber,
            organization: userData.organization
          }
        });
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
        return await prisma.course.create({
          data: {
            name: courseData.name,
            code: courseData.code,
            credits: courseData.credits,
            description: courseData.description,
            instructorId: courseData.instructorId,
            isActive: courseData.isActive !== undefined ? courseData.isActive : true
          }
        });
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

    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds.map((id: any) => parseInt(String(id))) }
      },
      data: { isActive }
    });

    res.json({
      message: `Status updated for ${result.count} users`,
      updatedCount: result.count
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

    const result = await prisma.user.deleteMany({
      where: {
        id: { in: userIds.map((id: any) => parseInt(String(id))) }
      }
    });

    res.json({
      message: `${result.count} users deleted successfully`,
      deletedCount: result.count
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
        
        return await prisma.grade.create({
          data: {
            studentId: parseInt(String(gradeData.studentId)),
            courseId: parseInt(String(gradeData.courseId)),
            assignmentType: gradeData.assignmentType,
            score: parseFloat(String(gradeData.score)),
            maxScore: parseFloat(String(gradeData.maxScore)),
            percentage,
            comments: gradeData.comments
          }
        });
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
