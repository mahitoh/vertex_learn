import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { validateExpense, validatePagination, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/expenses - List expenses with filters and pagination
router.get('/', authenticateJWT, requireAdmin, validatePagination, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (category) {
      where.category = { contains: category as string, mode: 'insensitive' };
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.expense.count({ where })
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/expenses/:id - Get expense by ID
router.get('/:id', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({
      where: { id: Number(id) }
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/expenses - Create new expense
router.post('/', authenticateJWT, requireAdmin, validateExpense, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { category, amount, description } = req.body;

    const expense = await prisma.expense.create({
      data: {
        category,
        amount: Number(amount),
        description
      }
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', authenticateJWT, requireAdmin, validateExpense, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, amount, description } = req.body;

    const existingExpense = await prisma.expense.findUnique({
      where: { id: Number(id) }
    });

    if (!existingExpense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const expense = await prisma.expense.update({
      where: { id: Number(id) },
      data: {
        category,
        amount: Number(amount),
        description
      }
    });

    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingExpense = await prisma.expense.findUnique({
      where: { id: Number(id) }
    });

    if (!existingExpense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id: Number(id) }
    });

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/expenses/stats - Get expense statistics
router.get('/stats', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const [totalExpenses, totalAmount, categoryStats] = await Promise.all([
      prisma.expense.count(),
      prisma.expense.aggregate({
        _sum: { amount: true }
      }),
      prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalExpenses,
        totalAmount: totalAmount._sum.amount || 0,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
