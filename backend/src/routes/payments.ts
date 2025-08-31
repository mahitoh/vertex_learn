import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { validatePagination, validateId } from '../middleware/validation.js';
import { requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all payments with pagination
router.get('/', validatePagination, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { studentId, status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    
    let queryStr = `
      SELECT p.*, s.id as student_id, s.name as student_name, s.email as student_email,
             i.id as invoice_id, i.invoice_number, i.amount as invoice_amount
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN invoices i ON p.invoice_id = i.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (studentId) {
      queryStr += ' AND p.student_id = ?';
      queryParams.push(parseInt(String(studentId)));
    }
    if (status) {
      queryStr += ' AND LOWER(p.status) = LOWER(?)';
      queryParams.push(String(status));
    }

    queryStr += ' ORDER BY p.payment_date DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(String(limit)), skip);

    const { rows: payments } = await query(queryStr, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM payments p WHERE 1=1';
    const countParams = [];

    if (studentId) {
      countQuery += ' AND p.student_id = ?';
      countParams.push(parseInt(String(studentId)));
    }
    if (status) {
      countQuery += ' AND LOWER(p.status) = LOWER(?)';
      countParams.push(String(status));
    }

    const { rows: [{ total }] } = await query(countQuery, countParams);

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

    // Insert payment record
    const insertPaymentQuery = `
      INSERT INTO payments (invoice_id, student_id, amount, payment_method, transaction_id, status, payment_date)
      VALUES (?, ?, ?, ?, ?, 'completed', NOW())
    `;
    const paymentParams = [
      parseInt(String(invoiceId)),
      parseInt(String(studentId)),
      parseFloat(String(amount)),
      String(paymentMethod),
      transactionId ? String(transactionId) : null
    ];
    
    const { insertId } = await query(insertPaymentQuery, paymentParams);
    
    // Update invoice status
    const updateInvoiceQuery = `UPDATE invoices SET status = 'paid' WHERE id = ?`;
    await query(updateInvoiceQuery, [parseInt(String(invoiceId))]);
    
    // Get the created payment
    const { rows: [payment] } = await query('SELECT * FROM payments WHERE id = ?', [insertId]);

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
