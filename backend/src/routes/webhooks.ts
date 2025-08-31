import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Payment webhook handler
router.post('/payment', async (req: Request, res: Response) => {
  try {
    const { invoiceId, status, transactionId, amount } = req.body;
    
    if (!invoiceId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update invoice status
    await query(
      'UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?',
      [String(status), parseInt(String(invoiceId))]
    );

    // Create payment record if payment successful
    if (status === 'paid' && transactionId && amount) {
      await query(
        `INSERT INTO payments (invoice_id, student_id, amount, payment_method, transaction_id, status, payment_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [
          parseInt(String(invoiceId)),
          1, // This should come from the webhook payload
          parseFloat(String(amount)),
          'webhook',
          String(transactionId),
          'completed'
        ]
      );
    }

    res.json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Internal server error while processing webhook' });
  }
});

// SMS/Email notification webhook
router.post('/notification', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { type, recipientId, message, status } = req.body;
    
    if (!type || !recipientId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log notification delivery status
    await query(
      `INSERT INTO notifications (message, recipient_id, sender_id, type, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        String(message),
        parseInt(String(recipientId)),
        1, // System
        String(type),
        String(status) || 'unread'
      ]
    );

    res.json({ message: 'Notification webhook processed successfully' });

  } catch (error) {
    console.error('Notification webhook error:', error);
    res.status(500).json({ error: 'Internal server error while processing webhook' });
  }
});

// External system sync webhook
router.post('/sync', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { entity, action, data } = req.body;
    
    if (!entity || !action || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Handle different sync actions
    switch (entity) {
      case 'user':
        if (action === 'create') {
          await query(
            `INSERT INTO users (email, password, first_name, last_name, name, role_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [data.email, data.password, data.firstName, data.lastName, data.name, data.roleId || 1]
          );
        } else if (action === 'update') {
          const { id, ...updateData } = data;
          const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
          const values = Object.values(updateData);
          await query(
            `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`,
            [...values, parseInt(String(id))]
          );
        }
        break;
      
      case 'course':
        if (action === 'create') {
          await query(
            `INSERT INTO courses (name, code, credits, description, instructor_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [data.name, data.code, data.credits, data.description, data.instructorId]
          );
        } else if (action === 'update') {
          const { id, ...updateData } = data;
          const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
          const values = Object.values(updateData);
          await query(
            `UPDATE courses SET ${fields}, updated_at = NOW() WHERE id = ?`,
            [...values, parseInt(String(id))]
          );
        }
        break;
      
      default:
        return res.status(400).json({ error: 'Unsupported entity type' });
    }

    res.json({ message: 'Sync webhook processed successfully' });

  } catch (error) {
    console.error('Sync webhook error:', error);
    res.status(500).json({ error: 'Internal server error while processing webhook' });
  }
});

// Webhook configuration management
router.get('/config', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get webhook configurations from settings
    const webhookConfigsResult = await query(
      'SELECT * FROM settings WHERE `key` LIKE ?',
      ['webhook_%']
    );

    res.json({ webhookConfigs: webhookConfigsResult.rows });

  } catch (error) {
    console.error('Get webhook config error:', error);
    res.status(500).json({ error: 'Internal server error while fetching webhook config' });
  }
});

// Update webhook configuration
router.put('/config/:key', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    const webhookKey = `webhook_${key}`;

    // Check if setting exists
    const existingResult = await query(
      'SELECT id FROM settings WHERE `key` = ?',
      [webhookKey]
    );

    let webhookConfig;
    if (existingResult.rows.length > 0) {
      // Update existing
      await query(
        'UPDATE settings SET value = ?, description = ?, updated_at = NOW() WHERE `key` = ?',
        [String(value), String(description), webhookKey]
      );
      const updatedResult = await query(
        'SELECT * FROM settings WHERE `key` = ?',
        [webhookKey]
      );
      webhookConfig = updatedResult.rows[0];
    } else {
      // Create new
      await query(
        'INSERT INTO settings (`key`, value, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [webhookKey, String(value), String(description)]
      );
      const createdResult = await query(
        'SELECT * FROM settings WHERE `key` = ?',
        [webhookKey]
      );
      webhookConfig = createdResult.rows[0];
    }

    res.json({ webhookConfig });

  } catch (error) {
    console.error('Update webhook config error:', error);
    res.status(500).json({ error: 'Internal server error while updating webhook config' });
  }
});

export default router;
