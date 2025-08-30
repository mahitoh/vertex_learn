import { Router } from 'express';
import { prisma } from '../config/database.js';
import { validatePagination, validateId } from '../middleware/validation.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get all performance records
router.get('/', validatePagination, requireAdmin, async (req: any, res: any) => {
  try {
    const { userId, period, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {
      ...(userId ? { userId: parseInt(userId as string) } : {}),
      ...(period ? { period: { equals: period as string } } : {})
    };

    const performances = await prisma.performance.findMany({
      where,
      skip,
      take: parseInt(limit as string),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.performance.count({ where });

    res.json({
      data: performances,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });

  } catch (error) {
    console.error('Get performances error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching performances'
    });
  }
});

// Create performance record
router.post('/', requireAdmin, async (req: any, res: any) => {
  try {
    const { userId, period, score, comments } = req.body;

    const performance = await prisma.performance.create({
      data: {
        userId,
        period,
        score,
        comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Performance record created successfully',
      performance
    });

  } catch (error) {
    console.error('Create performance error:', error);
    res.status(500).json({
      error: 'Internal server error while creating performance record'
    });
  }
});

export default router;

