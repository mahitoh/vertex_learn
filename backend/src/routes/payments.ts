import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { validatePagination, validateId } from '../middleware/validation.js';
import { requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all payments with pagination
router.get('/', validatePagination, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId, status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(studentId ? { studentId: parseInt(String(studentId)) } : {}),
      ...(status ? { status: { equals: String(status), mode: 'insensitive' } } : {})
    };

    const payments = await prisma.payment.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        student: { select: { id: true, name: true, email: true } },
        invoice: { select: { id: true, invoiceNumber: true, amount: true } }
      },
      orderBy: { paymentDate: 'desc' }
    });

    const total = await prisma.payment.count({ where });

    res.json({
      data: payments,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error while fetching payments' });
  }
});

// Create payment
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { invoiceId, studentId, amount, paymentMethod, transactionId } = req.body;

    const payment = await prisma.payment.create({
      data: {
        invoiceId: parseInt(String(invoiceId)),
        studentId: parseInt(String(studentId)),
        amount: parseFloat(String(amount)),
        paymentMethod: String(paymentMethod),
        transactionId: transactionId ? String(transactionId) : null,
        status: 'completed'
      }
    });

    // Update invoice status
    await prisma.invoice.update({
      where: { id: parseInt(String(invoiceId)) },
      data: { status: 'paid' }
    });

    res.status(201).json({
      message: 'Payment created successfully',
      payment
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error while creating payment' });
  }
});

export default router;
