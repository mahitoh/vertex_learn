import { Router } from 'express';
import { prisma } from '../config/database.js';
import { validateAsset, validatePagination, validateId } from '../middleware/validation.js';
import { requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Request, Response } from 'express';

const router = Router();

// Get all assets
router.get('/', validatePagination, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { category, status, assignedTo, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(category ? { category: { equals: String(category), mode: 'insensitive' } } : {}),
      ...(status ? { status: { equals: String(status), mode: 'insensitive' } } : {}),
      ...(assignedTo ? { assignedTo: parseInt(String(assignedTo)) } : {})
    };

    const assets = await prisma.asset.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.asset.count({ where });

    res.json({
      data: assets,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching assets'
    });
  }
});

// Create asset
router.post('/', validateAsset, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, category, status, purchaseDate, quantity, assignedTo } = req.body;

    const asset = await prisma.asset.create({
      data: {
        name,
        category,
        status,
        purchaseDate: new Date(purchaseDate),
        quantity,
        assignedTo
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
      message: 'Asset created successfully',
      asset
    });

  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      error: 'Internal server error while creating asset'
    });
  }
});

export default router;

