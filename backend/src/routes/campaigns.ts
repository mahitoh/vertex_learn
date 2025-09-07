import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { requireAdmin, requireStaffOrAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all campaigns
router.get('/', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = 'WHERE 1=1';
    let params: any[] = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      whereClause += ' AND campaign_type = ?';
      params.push(type);
    }

    const campaignsQuery = `
      SELECT 
        id, name, campaign_type, status, budget, spent_amount,
        leads_generated, conversions, start_date, end_date,
        description, created_by, created_at, updated_at
      FROM marketing_campaigns
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const result = await query(campaignsQuery, [...params, parseInt(limit as string), offset]);

    // Calculate ROI for each campaign
    const campaignsWithROI = result.rows.map((campaign: any) => {
      const roi = campaign.spent_amount > 0 
        ? ((campaign.conversions * 1000 - campaign.spent_amount) / campaign.spent_amount * 100).toFixed(2)
        : 0;
      
      return {
        ...campaign,
        roi: parseFloat(roi as string),
        conversion_rate: campaign.leads_generated > 0 
          ? ((campaign.conversions / campaign.leads_generated) * 100).toFixed(2)
          : 0
      };
    });

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM marketing_campaigns
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = countResult.rows[0].total;

    res.json({
      success: true,
      data: campaignsWithROI,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      error: 'Failed to fetch campaigns'
    });
  }
});

// Get campaign by ID
router.get('/:id', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        c.id, c.name, c.campaign_type, c.status, c.budget, c.spent_amount,
        c.leads_generated, c.conversions, c.start_date, c.end_date,
        c.description, c.created_by, c.created_at, c.updated_at,
        u.name as created_by_name
      FROM marketing_campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    const campaign = result.rows[0];
    const roi = campaign.spent_amount > 0 
      ? ((campaign.conversions * 1000 - campaign.spent_amount) / campaign.spent_amount * 100).toFixed(2)
      : 0;
    
    const campaignWithROI = {
      ...campaign,
      roi: parseFloat(roi as string),
      conversion_rate: campaign.leads_generated > 0 
        ? ((campaign.conversions / campaign.leads_generated) * 100).toFixed(2)
        : 0
    };
    
    res.json({
      success: true,
      data: campaignWithROI
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign'
    });
  }
});

// Create new campaign
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      name, campaign_type, budget, start_date, end_date, 
      description, leads_generated = 0, conversions = 0, spent_amount = 0 
    } = req.body;
    const created_by = req.user!.id;
    
    if (!name || !campaign_type || !budget || !start_date || !end_date) {
      return res.status(400).json({
        error: 'Name, campaign type, budget, start date, and end date are required'
      });
    }

    if (budget <= 0) {
      return res.status(400).json({
        error: 'Budget must be greater than 0'
      });
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        error: 'End date must be after start date'
      });
    }
    
    const result = await query(`
      INSERT INTO marketing_campaigns (
        name, campaign_type, status, budget, spent_amount, leads_generated, 
        conversions, start_date, end_date, description, created_by, created_at
      ) VALUES (?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      name, campaign_type, budget, spent_amount, leads_generated, 
      conversions, start_date, end_date, description || '', created_by
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { id: (result.rows as any).insertId }
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      error: 'Failed to create campaign'
    });
  }
});

// Update campaign
router.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, campaign_type, status, budget, spent_amount, leads_generated, 
      conversions, start_date, end_date, description 
    } = req.body;
    
    if (!name || !campaign_type || !budget || !start_date || !end_date) {
      return res.status(400).json({
        error: 'Name, campaign type, budget, start date, and end date are required'
      });
    }

    if (budget <= 0) {
      return res.status(400).json({
        error: 'Budget must be greater than 0'
      });
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        error: 'End date must be after start date'
      });
    }
    
    const result = await query(`
      UPDATE marketing_campaigns 
      SET name = ?, campaign_type = ?, status = ?, budget = ?, spent_amount = ?, 
          leads_generated = ?, conversions = ?, start_date = ?, end_date = ?, 
          description = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      name, campaign_type, status || 'active', budget, spent_amount || 0, 
      leads_generated || 0, conversions || 0, start_date, end_date, 
      description || '', id
    ]);
    
    if ((result.rows as any).affectedRows === 0) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      error: 'Failed to update campaign'
    });
  }
});

// Delete campaign
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM marketing_campaigns WHERE id = ?', [id]);
    
    if ((result.rows as any).affectedRows === 0) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      error: 'Failed to delete campaign'
    });
  }
});

// Get campaign statistics
router.get('/stats/overview', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Total campaigns
    const totalResult = await query(`
      SELECT 
        COUNT(*) as total_campaigns,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_campaigns,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_campaigns
      FROM marketing_campaigns
    `);

    // Total budget and spending
    const budgetResult = await query(`
      SELECT 
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(SUM(spent_amount), 0) as total_spent,
        COALESCE(SUM(leads_generated), 0) as total_leads,
        COALESCE(SUM(conversions), 0) as total_conversions
      FROM marketing_campaigns
    `);

    // Campaign performance by type
    const typeResult = await query(`
      SELECT 
        campaign_type,
        COUNT(*) as campaign_count,
        SUM(budget) as total_budget,
        SUM(spent_amount) as total_spent,
        SUM(leads_generated) as total_leads,
        SUM(conversions) as total_conversions
      FROM marketing_campaigns
      GROUP BY campaign_type
      ORDER BY total_spent DESC
    `);

    // Monthly campaign performance (last 6 months)
    const monthlyResult = await query(`
      SELECT 
        DATE_FORMAT(start_date, '%Y-%m') as month,
        COUNT(*) as campaigns_started,
        SUM(budget) as total_budget,
        SUM(spent_amount) as total_spent,
        SUM(leads_generated) as total_leads,
        SUM(conversions) as total_conversions
      FROM marketing_campaigns 
      WHERE start_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(start_date, '%Y-%m')
      ORDER BY month DESC
    `);

    // Top performing campaigns
    const topCampaignsResult = await query(`
      SELECT 
        id, name, campaign_type, leads_generated, conversions, 
        spent_amount, budget,
        CASE 
          WHEN spent_amount > 0 THEN ((conversions * 1000 - spent_amount) / spent_amount * 100)
          ELSE 0 
        END as roi
      FROM marketing_campaigns
      WHERE conversions > 0
      ORDER BY roi DESC
      LIMIT 5
    `);

    const stats = totalResult.rows[0];
    const budget = budgetResult.rows[0];
    
    // Calculate overall ROI
    const overallROI = budget.total_spent > 0 
      ? ((budget.total_conversions * 1000 - budget.total_spent) / budget.total_spent * 100).toFixed(2)
      : 0;

    // Calculate overall conversion rate
    const overallConversionRate = budget.total_leads > 0 
      ? ((budget.total_conversions / budget.total_leads) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        totalCampaigns: stats.total_campaigns,
        activeCampaigns: stats.active_campaigns,
        completedCampaigns: stats.completed_campaigns,
        pausedCampaigns: stats.paused_campaigns,
        totalBudget: budget.total_budget,
        totalSpent: budget.total_spent,
        totalLeads: budget.total_leads,
        totalConversions: budget.total_conversions,
        overallROI: parseFloat(overallROI as string),
        overallConversionRate: parseFloat(overallConversionRate as string),
        campaignsByType: typeResult.rows,
        monthlyPerformance: monthlyResult.rows,
        topCampaigns: topCampaignsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching campaign statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign statistics'
    });
  }
});

// Get campaign types
router.get('/types/list', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const types = [
      'Social Media',
      'Google Ads',
      'Email Marketing',
      'Content Marketing',
      'Print Advertising',
      'Radio/TV',
      'Event Marketing',
      'Referral Program',
      'SEO',
      'Other'
    ];

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error fetching campaign types:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign types'
    });
  }
});

export default router;