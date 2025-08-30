import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { validateSetting, validatePagination, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/settings - List all settings
router.get('/', authenticateJWT, requireAdmin, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const { key, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (key) {
      where.key = { contains: key as string, mode: 'insensitive' };
    }

    const [settings, total] = await Promise.all([
      prisma.setting.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { key: 'asc' }
      }),
      prisma.setting.count({ where })
    ]);

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
    const setting = await prisma.setting.findUnique({
      where: { key }
    });

    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    res.json({ success: true, data: setting });
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
    const existingSetting = await prisma.setting.findUnique({
      where: { key }
    });

    if (existingSetting) {
      return res.status(409).json({ success: false, message: 'Setting already exists' });
    }

    const setting = await prisma.setting.create({
      data: { key, value }
    });

    res.status(201).json({ success: true, data: setting });
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

    const existingSetting = await prisma.setting.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    const setting = await prisma.setting.update({
      where: { key },
      data: { value }
    });

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

    const existingSetting = await prisma.setting.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    await prisma.setting.delete({
      where: { key }
    });

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
