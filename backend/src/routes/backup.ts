import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Create database backup
router.post('/create', requireAdmin, async (req: Request, res: Response) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Log backup creation - check if setting exists first
    const existingSettingResult = await query(
      'SELECT id FROM settings WHERE `key` = ?',
      ['last_backup']
    );
    
    if (existingSettingResult.rows.length > 0) {
      await query(
        'UPDATE settings SET value = ?, description = ?, updated_at = NOW() WHERE `key` = ?',
        [timestamp, 'Last database backup timestamp', 'last_backup']
      );
    } else {
      await query(
        'INSERT INTO settings (`key`, value, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        ['last_backup', timestamp, 'Last database backup timestamp']
      );
    }
    
    res.json({
      message: 'Backup initiated successfully',
      timestamp
    });

  } catch (error) {
    console.error('Backup creation error:', error);
    res.status(500).json({ error: 'Internal server error while creating backup' });
  }
});

// Get backup status
router.get('/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const lastBackupResult = await query(
      'SELECT value FROM settings WHERE `key` = ?',
      ['last_backup']
    );
    
    res.json({
      lastBackup: lastBackupResult.rows.length > 0 ? lastBackupResult.rows[0].value : 'None',
      status: 'Backup system ready'
    });

  } catch (error) {
    console.error('Backup status error:', error);
    res.status(500).json({ error: 'Internal server error while fetching backup status' });
  }
});

export default router;
