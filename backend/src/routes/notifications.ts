import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth.js';
import { validateNotification, validatePagination, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/notifications - List notifications with filters and pagination
router.get('/', authenticateJWT, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const { recipientId, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (recipientId) {
      where.recipientId = Number(recipientId);
    }
    if (status) {
      where.status = status as string;
    }

    // If no recipientId specified, show notifications for current user
    if (!recipientId && req.user) {
      where.recipientId = req.user.id;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          recipient: {
            select: { id: true, name: true, email: true }
          },
          sender: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/notifications/:id - Get notification by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
      include: {
        recipient: {
          select: { id: true, name: true, email: true }
        },
        sender: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Check if user is the recipient or has admin access
    if (notification.recipientId !== req.user?.id && req.user?.role?.name !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/notifications - Create new notification
router.post('/', authenticateJWT, validateNotification, handleValidationErrors, async (req, res) => {
  try {
    const { message, recipientId } = req.body;

    const notification = await prisma.notification.create({
      data: {
        message,
        recipientId: Number(recipientId),
        senderId: req.user!.id
      },
      include: {
        recipient: {
          select: { id: true, name: true, email: true }
        },
        sender: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/notifications/:id - Update notification status
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingNotification = await prisma.notification.findUnique({
      where: { id: Number(id) }
    });

    if (!existingNotification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Check if user is the recipient or has admin access
    if (existingNotification.recipientId !== req.user?.id && req.user?.role?.name !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const notification = await prisma.notification.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        recipient: {
          select: { id: true, name: true, email: true }
        },
        sender: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const existingNotification = await prisma.notification.findUnique({
      where: { id: Number(id) }
    });

    if (!existingNotification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Check if user is the recipient or has admin access
    if (existingNotification.recipientId !== req.user?.id && req.user?.role?.name !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await prisma.notification.delete({
      where: { id: Number(id) }
    });

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/notifications/mark-read - Mark notifications as read
router.put('/mark-read', authenticateJWT, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'IDs must be an array' });
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: ids.map(Number) },
        recipientId: req.user!.id
      },
      data: { status: 'read' }
    });

    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', authenticateJWT, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        recipientId: req.user!.id,
        status: 'unread'
      }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
