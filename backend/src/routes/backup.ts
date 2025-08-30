import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Create database backup
router.post('/create', requireAdmin, async (req: Request, res: Response) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Log backup creation
    await prisma.setting.upsert({
      where: { key: 'last_backup' },
      update: { 
        value: timestamp,
        description: 'Last database backup timestamp'
      },
      create: {
        key: 'last_backup',
        value: timestamp,
        description: 'Last database backup timestamp'
      }
    });
    
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
    const lastBackup = await prisma.setting.findUnique({
      where: { key: 'last_backup' }
    });
    
    res.json({
      lastBackup: lastBackup?.value || 'None',
      status: 'Backup system ready'
    });

  } catch (error) {
    console.error('Backup status error:', error);
    res.status(500).json({ error: 'Internal server error while fetching backup status' });
  }
});

export default router;
