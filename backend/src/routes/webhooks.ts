import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
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
    await prisma.invoice.update({
      where: { id: parseInt(String(invoiceId)) },
      data: { status: String(status) }
    });

    // Create payment record if payment successful
    if (status === 'paid' && transactionId && amount) {
      await prisma.payment.create({
        data: {
          invoiceId: parseInt(String(invoiceId)),
          studentId: 1, // This should come from the webhook payload
          amount: parseFloat(String(amount)),
          paymentMethod: 'webhook',
          transactionId: String(transactionId),
          status: 'completed'
        }
      });
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
    await prisma.notification.create({
      data: {
        message: String(message),
        recipientId: parseInt(String(recipientId)),
        senderId: 1, // System
        type: String(type),
        status: String(status) || 'unread'
      }
    });

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
          await prisma.user.create({ data });
        } else if (action === 'update') {
          const { id, ...updateData } = data;
          await prisma.user.update({
            where: { id: parseInt(String(id)) },
            data: updateData
          });
        }
        break;
      
      case 'course':
        if (action === 'create') {
          await prisma.course.create({ data });
        } else if (action === 'update') {
          const { id, ...updateData } = data;
          await prisma.course.update({
            where: { id: parseInt(String(id)) },
            data: updateData
          });
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
    const webhookConfigs = await prisma.setting.findMany({
      where: { key: { startsWith: 'webhook_' } }
    });

    res.json({ webhookConfigs });

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

    const webhookConfig = await prisma.setting.upsert({
      where: { key: `webhook_${key}` },
      update: { value: String(value), description: String(description) },
      create: {
        key: `webhook_${key}`,
        value: String(value),
        description: String(description)
      }
    });

    res.json({ webhookConfig });

  } catch (error) {
    console.error('Update webhook config error:', error);
    res.status(500).json({ error: 'Internal server error while updating webhook config' });
  }
});

export default router;
