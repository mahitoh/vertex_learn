import { Router } from 'express';
import { query } from '../config/database.js';
import { validateAsset, validatePagination, validateId } from '../middleware/validation.js';
import { requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Request, Response } from 'express';

const router = Router();

// Get all assets
router.get('/', validatePagination, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { category, status, assignedTo, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    // Build WHERE conditions
    let whereConditions = [];
    let params = [];
    
    if (category) {
      whereConditions.push('a.category LIKE ?');
      params.push(`%${category}%`);
    }
    
    if (status) {
      whereConditions.push('a.status LIKE ?');
      params.push(`%${status}%`);
    }
    
    if (assignedTo) {
      whereConditions.push('a.assigned_to = ?');
      params.push(parseInt(String(assignedTo)));
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get assets with user information
    const assetsResult = await query(
      `SELECT a.*, u.id as user_id, u.name as user_name, u.email as user_email
       FROM assets a
       LEFT JOIN users u ON a.assigned_to = u.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(String(limit)), offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM assets a ${whereClause}`,
      params
    );

    const assets = assetsResult.rows.map((asset: any) => ({
      ...asset,
      user: asset.user_id ? {
        id: asset.user_id,
        name: asset.user_name,
        email: asset.user_email
      } : null
    }));

    const total = countResult.rows[0].total;

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

    const assetResult = await query(
      `INSERT INTO assets (name, category, status, purchase_date, quantity, assigned_to, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, category, status, new Date(purchaseDate), quantity, assignedTo || null]
    );

    // Get the created asset with user information
    const createdAssetResult = await query(
      `SELECT a.*, u.id as user_id, u.name as user_name, u.email as user_email
       FROM assets a
       LEFT JOIN users u ON a.assigned_to = u.id
       WHERE a.id = ?`,
      [assetResult.rows.insertId]
    );

    const asset = createdAssetResult.rows[0];
    const formattedAsset = {
      ...asset,
      user: asset.user_id ? {
        id: asset.user_id,
        name: asset.user_name,
        email: asset.user_email
      } : null
    };

    res.status(201).json({
      message: 'Asset created successfully',
      asset: formattedAsset
    });

  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      error: 'Internal server error while creating asset'
    });
  }
});

export default router;

