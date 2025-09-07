import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { requireAdmin, requireStaffOrAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all invoices
router.get('/', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, student_id, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = 'WHERE 1=1';
    let params: any[] = [];

    if (status) {
      whereClause += ' AND i.status = ?';
      params.push(status);
    }

    if (student_id) {
      whereClause += ' AND i.student_id = ?';
      params.push(student_id);
    }

    const invoicesQuery = `
      SELECT 
        i.id, i.student_id, i.amount, i.due_date, i.status, i.description,
        i.created_at, i.updated_at,
        u.name as student_name, u.email as student_email
      FROM invoices i
      LEFT JOIN users u ON i.student_id = u.id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const result = await query(invoicesQuery, [...params, parseInt(limit as string), offset]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM invoices i
      LEFT JOIN users u ON i.student_id = u.id
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
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      error: 'Failed to fetch invoices'
    });
  }
});

// Get invoice by ID
router.get('/:id', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        i.id, i.student_id, i.amount, i.due_date, i.status, i.description,
        i.created_at, i.updated_at,
        u.name as student_name, u.email as student_email, u.phone as student_phone
      FROM invoices i
      LEFT JOIN users u ON i.student_id = u.id
      WHERE i.id = ?
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      error: 'Failed to fetch invoice'
    });
  }
});

// Create new invoice
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { student_id, amount, due_date, description } = req.body;
    
    if (!student_id || !amount || !due_date) {
      return res.status(400).json({
        error: 'Student ID, amount, and due date are required'
      });
    }

    // Check if student exists
    const studentResult = await query('SELECT id FROM users WHERE id = ? AND role_id = 3', [student_id]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Student not found'
      });
    }
    
    const result = await query(`
      INSERT INTO invoices (student_id, amount, due_date, description, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `, [student_id, amount, due_date, description || 'Tuition Fee']);
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { id: (result.rows as any).insertId }
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      error: 'Failed to create invoice'
    });
  }
});

// Update invoice status (for payments)
router.put('/:id', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, payment_method, payment_reference } = req.body;
    
    if (!status) {
      return res.status(400).json({
        error: 'Status is required'
      });
    }

    let updateQuery = 'UPDATE invoices SET status = ?, updated_at = NOW()';
    let params = [status];

    if (status === 'paid') {
      updateQuery += ', paid_at = NOW()';
      if (payment_method) {
        updateQuery += ', payment_method = ?';
        params.push(payment_method);
      }
      if (payment_reference) {
        updateQuery += ', payment_reference = ?';
        params.push(payment_reference);
      }
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    const result = await query(updateQuery, params);
    
    if ((result.rows as any).affectedRows === 0) {
      return res.status(404).json({
        error: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      error: 'Failed to update invoice'
    });
  }
});

// Get invoice statistics
router.get('/stats/overview', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Total revenue
    const revenueResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as total_revenue
      FROM invoices 
      WHERE status = 'paid'
    `);

    // Pending payments
    const pendingResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as pending_amount, COUNT(*) as pending_count
      FROM invoices 
      WHERE status = 'pending'
    `);

    // Overdue payments
    const overdueResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as overdue_amount, COUNT(*) as overdue_count
      FROM invoices 
      WHERE status = 'pending' AND due_date < CURDATE()
    `);

    // Monthly revenue (last 6 months)
    const monthlyRevenueResult = await query(`
      SELECT 
        DATE_FORMAT(paid_at, '%Y-%m') as month,
        SUM(amount) as revenue
      FROM invoices 
      WHERE status = 'paid' AND paid_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
      ORDER BY month DESC
    `);

    res.json({
      success: true,
      data: {
        totalRevenue: revenueResult.rows[0].total_revenue,
        pendingAmount: pendingResult.rows[0].pending_amount,
        pendingCount: pendingResult.rows[0].pending_count,
        overdueAmount: overdueResult.rows[0].overdue_amount,
        overdueCount: overdueResult.rows[0].overdue_count,
        monthlyRevenue: monthlyRevenueResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching invoice statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch invoice statistics'
    });
  }
});

// Generate PDF receipt (mock implementation)
router.get('/:id/receipt', requireStaffOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        i.id, i.student_id, i.amount, i.due_date, i.status, i.description,
        i.created_at, i.paid_at, i.payment_method, i.payment_reference,
        u.name as student_name, u.email as student_email
      FROM invoices i
      LEFT JOIN users u ON i.student_id = u.id
      WHERE i.id = ? AND i.status = 'paid'
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Paid invoice not found'
      });
    }

    const invoice = result.rows[0];
    
    // Mock PDF generation - in real implementation, use pdfkit
    const receiptData = {
      receiptId: `RCP-${invoice.id}-${Date.now()}`,
      invoice: invoice,
      generatedAt: new Date().toISOString(),
      school: {
        name: 'Vertex Learn Academy',
        address: '123 Education Street, Learning City',
        phone: '+1 (555) 123-4567',
        email: 'finance@vertexlearn.com'
      }
    };
    
    res.json({
      success: true,
      message: 'Receipt generated successfully',
      data: receiptData
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({
      error: 'Failed to generate receipt'
    });
  }
});

export default router;