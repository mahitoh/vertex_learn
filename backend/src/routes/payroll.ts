import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { validatePayroll, validatePagination, validateId } from '../middleware/validation.js';
import { requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all payroll records with pagination and filters
router.get('/', validatePagination, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { employeeId, payPeriod, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    const where = {
      ...(employeeId ? { employeeId: parseInt(String(employeeId)) } : {}),
      ...(payPeriod ? { payPeriod: { equals: String(payPeriod) } } : {})
    };

    const payrolls = await prisma.payroll.findMany({
      where,
      skip,
      take: parseInt(String(limit)),
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      },
      orderBy: { payPeriod: 'desc' }
    });

    const total = await prisma.payroll.count({ where });

    res.json({
      data: payrolls,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages: Math.ceil(total / parseInt(String(limit)))
    });

  } catch (error) {
    console.error('Get payrolls error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching payroll records'
    });
  }
});

// Create payroll record
router.post('/', validatePayroll, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { employeeId, payPeriod, baseSalary, bonuses, deductions, netSalary } = req.body;

    const payroll = await prisma.payroll.create({
      data: {
        employeeId: parseInt(String(employeeId)),
        payPeriod: String(payPeriod),
        baseSalary: parseFloat(String(baseSalary)),
        bonuses: bonuses ? parseFloat(String(bonuses)) : 0,
        deductions: deductions ? parseFloat(String(deductions)) : 0,
        netSalary: parseFloat(String(netSalary))
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Payroll record created successfully',
      payroll
    });

  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({
      error: 'Internal server error while creating payroll record'
    });
  }
});

export default router;

