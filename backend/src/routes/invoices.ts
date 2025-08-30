import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { validateInvoice, validatePagination, validateId } from '../middleware/validation.js';
import { requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all invoices
router.get('/', validatePagination, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId, status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(studentId ? { studentId: parseInt(String(studentId)) } : {}),
      ...(status ? { status: { equals: String(status), mode: 'insensitive' } } : {})
    };

    const invoices = await prisma.invoice.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.invoice.count({ where });

    res.json({
      data: invoices,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching invoices'
    });
  }
});

// Create invoice
router.post('/', validateInvoice, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId, amount, description, dueDate } = req.body;
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        invoiceNumber,
        amount,
        description,
        dueDate: new Date(dueDate),
        status: 'pending'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });

  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      error: 'Internal server error while creating invoice'
    });
  }
});

export default router;

