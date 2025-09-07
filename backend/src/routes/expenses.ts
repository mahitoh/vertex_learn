import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { requireAdmin, requireStaffOrAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all expenses
router.get('/', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, date_from, date_to, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = 'WHERE 1=1';
    let params: any[] = [];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (date_from) {
      whereClause += ' AND expense_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND expense_date <= ?';
      params.push(date_to);
    }

    const expensesQuery = `
      SELECT 
        id, amount, category, description, expense_date, 
        created_by, created_at, updated_at
      FROM expenses
      ${whereClause}
      ORDER BY expense_date DESC, created_at DESC
      LIMIT ? OFFSET ?
    `;

    const result = await query(expensesQuery, [...params, parseInt(limit as string), offset]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM expenses
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = countResult.rows[0].total;

    res.json({
      success: true,
      data: result.rows,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      error: 'Failed to fetch expenses'
    });
  }
});

// Get expense by ID
router.get('/:id', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        e.id, e.amount, e.category, e.description, e.expense_date,
        e.created_by, e.created_at, e.updated_at,
        u.name as created_by_name
      FROM expenses e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      error: 'Failed to fetch expense'
    });
  }
});

// Create new expense
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, category, description, expense_date } = req.body;
    const created_by = req.user!.id;
    
    if (!amount || !category || !expense_date) {
      return res.status(400).json({
        error: 'Amount, category, and expense date are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }
    
    const result = await query(`
      INSERT INTO expenses (amount, category, description, expense_date, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [amount, category, description || '', expense_date, created_by]);
    
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { id: (result.rows as any).insertId }
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      error: 'Failed to create expense'
    });
  }
});

// Update expense
router.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category, description, expense_date } = req.body;
    
    if (!amount || !category || !expense_date) {
      return res.status(400).json({
        error: 'Amount, category, and expense date are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }
    
    const result = await query(`
      UPDATE expenses 
      SET amount = ?, category = ?, description = ?, expense_date = ?, updated_at = NOW()
      WHERE id = ?
    `, [amount, category, description || '', expense_date, id]);
    
    if ((result.rows as any).affectedRows === 0) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      error: 'Failed to update expense'
    });
  }
});

// Delete expense
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM expenses WHERE id = ?', [id]);
    
    if ((result.rows as any).affectedRows === 0) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      error: 'Failed to delete expense'
    });
  }
});

// Get expense statistics
router.get('/stats/overview', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Total expenses
    const totalResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses
    `);

    // Monthly expenses (last 6 months)
    const monthlyResult = await query(`
      SELECT 
        DATE_FORMAT(expense_date, '%Y-%m') as month,
        SUM(amount) as total_amount
      FROM expenses 
      WHERE expense_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
      ORDER BY month DESC
    `);

    // Expenses by category
    const categoryResult = await query(`
      SELECT 
        category,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM expenses
      WHERE expense_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY category
      ORDER BY total_amount DESC
    `);

    // Recent expenses
    const recentResult = await query(`
      SELECT 
        e.id, e.amount, e.category, e.description, e.expense_date,
        u.name as created_by_name
      FROM expenses e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalExpenses: totalResult.rows[0].total_expenses,
        monthlyExpenses: monthlyResult.rows,
        expensesByCategory: categoryResult.rows,
        recentExpenses: recentResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching expense statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch expense statistics'
    });
  }
});

// Get expense categories
router.get('/categories/list', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = [
      'Utilities',
      'Salaries',
      'Maintenance',
      'Marketing',
      'Office Supplies',
      'Technology',
      'Transportation',
      'Insurance',
      'Training',
      'Other'
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({
      error: 'Failed to fetch expense categories'
    });
  }
});

export default router;