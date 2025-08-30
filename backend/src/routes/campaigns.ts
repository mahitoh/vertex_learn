import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { validateCampaign, validatePagination, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/campaigns - List campaigns with filters and pagination
router.get('/', authenticateJWT, requireAdmin, validatePagination, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const skip = (Number(String(page)) - 1) * Number(String(limit));

    const where: any = {};
    if (status) {
      where.status = { equals: String(status), mode: 'insensitive' };
    }
    if (type) {
      where.type = { equals: String(type), mode: 'insensitive' };
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: Number(String(limit)),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.campaign.count({ where })
    ]);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: Number(String(page)),
        limit: Number(String(limit)),
        total,
        pages: Math.ceil(total / Number(String(limit)))
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/campaigns/:id - Get campaign by ID
router.get('/:id', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findUnique({
      where: { id: Number(String(id)) }
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/campaigns - Create new campaign
router.post('/', authenticateJWT, requireAdmin, validateCampaign, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { name, description, type, startDate, endDate, budget, targetAudience, status } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        type,
        startDate: new Date(String(startDate)),
        endDate: new Date(String(endDate)),
        budget: Number(budget),
        targetAudience,
        status: status || 'draft'
      }
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', authenticateJWT, requireAdmin, validateCampaign, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, type, startDate, endDate, budget, targetAudience, status } = req.body;

    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: Number(String(id)) }
    });

    if (!existingCampaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const campaign = await prisma.campaign.update({
      where: { id: Number(String(id)) },
      data: {
        name,
        description,
        type,
        startDate: new Date(String(startDate)),
        endDate: new Date(String(endDate)),
        budget: Number(budget),
        targetAudience,
        status
      }
    });

    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: Number(String(id)) }
    });

    if (!existingCampaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    await prisma.campaign.delete({
      where: { id: Number(String(id)) }
    });

    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/campaigns/stats - Get campaign statistics
router.get('/stats', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const [totalCampaigns, activeCampaigns, totalBudget] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'active' } }),
      prisma.campaign.aggregate({
        _sum: { budget: true }
      })
    ]);

    const campaignsByType = await prisma.campaign.groupBy({
      by: ['type'],
      _count: { id: true }
    });

    const campaignsByStatus = await prisma.campaign.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.json({
      success: true,
      data: {
        totalCampaigns,
        activeCampaigns,
        totalBudget: totalBudget._sum.budget || 0,
        campaignsByType,
        campaignsByStatus
      }
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
