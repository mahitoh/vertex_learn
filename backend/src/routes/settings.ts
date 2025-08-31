import express, { Request, Response } from 'express';
import { query } from '../config/database.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { validateSetting, validatePagination, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// GET /api/settings - List all settings
router.get('/', authenticateJWT, requireAdmin, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const { key, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const values = [];

    if (key) {
      whereClause += ' AND key_name LIKE ?';
      values.push(`%${key}%`);
    }

    const [settingsResult, totalResult] = await Promise.all([
      query(
        `SELECT * FROM settings ${whereClause} ORDER BY key_name ASC LIMIT ? OFFSET ?`,
        [...values, Number(limit), skip]
      ),
      query(
        `SELECT COUNT(*) as total FROM settings ${whereClause}`,
        values
      )
    ]);

    const settings = settingsResult.rows as any[];
    const total = (totalResult.rows as any[])[0].total;

    res.json({
      success: true,
      data: settings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/settings/:key - Get setting by key
router.get('/:key', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const settingResult = await query(
      'SELECT * FROM settings WHERE key_name = ?',
      [key]
    );

    if ((settingResult.rows as any[]).length === 0) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    res.json({ success: true, data: (settingResult.rows as any[])[0] });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/settings - Create new setting
router.post('/', authenticateJWT, requireAdmin, validateSetting, handleValidationErrors, async (req, res) => {
  try {
    const { key, value } = req.body;

    // Check if setting already exists
    const existingSettingResult = await query(
      'SELECT id FROM settings WHERE key_name = ?',
      [key]
    );

    if ((existingSettingResult.rows as any[]).length > 0) {
      return res.status(409).json({ success: false, message: 'Setting already exists' });
    }

    const settingResult = await query(
      'INSERT INTO settings (key_name, value, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [key, value]
    );

    const newSettingResult = await query(
      'SELECT * FROM settings WHERE id = ?',
      [(settingResult.rows as any).insertId]
    );

    res.status(201).json({ success: true, data: (newSettingResult.rows as any[])[0] });
  } catch (error) {
    console.error('Error creating setting:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/settings/:key - Update setting
router.put('/:key', authenticateJWT, requireAdmin, validateSetting, handleValidationErrors, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const existingSettingResult = await query(
      'SELECT * FROM settings WHERE `key` = ?',
      [key]
    );

    if (existingSettingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    await query(
      'UPDATE settings SET value = ?, updated_at = NOW() WHERE `key` = ?',
      [value, key]
    );
    
    const settingResult = await query(
      'SELECT * FROM settings WHERE `key` = ?',
      [key]
    );
    
    const setting = settingResult.rows[0];

    res.json({ success: true, data: setting });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/settings/:key - Delete setting
router.delete('/:key', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;

    const existingSettingResult = await query(
      'SELECT * FROM settings WHERE `key` = ?',
      [key]
    );

    if (existingSettingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    await query(
      'DELETE FROM settings WHERE `key` = ?',
      [key]
    );

    res.json({ success: true, message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/settings/bulk - Bulk update settings
router.post('/bulk', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Settings must be an array' });
    }

    const results = [];
    for (const setting of settings) {
      if (!setting.key || setting.value === undefined) {
        continue;
      }

      try {
        const result = await prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value }
        });
        results.push(result);
      } catch (error) {
        console.error(`Error updating setting ${setting.key}:`, error);
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error bulk updating settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/settings/export - Export settings as JSON
router.get('/export', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' }
    });

    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    res.json({ success: true, data: settingsObject });
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/settings/import - Import settings from JSON
router.post('/import', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings must be an object' });
    }

    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      try {
        const result = await prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        });
        results.push(result);
      } catch (error) {
        console.error(`Error importing setting ${key}:`, error);
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error importing settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
