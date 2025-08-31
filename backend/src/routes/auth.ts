import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query } from '../config/database.js';
import { UserService } from '../services/userService.js';
import { validateLogin, validateRegistration } from '../middleware/validation.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// User registration
router.post('/register', validateRegistration, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, employeeId, studentId, department, position, joinDate, admissionDate, class: className, rollNumber, organization, roleId } = req.body;

    // Check if user already exists
    const existingUserResult = await query(
      'SELECT id FROM users WHERE email = ? OR employee_id = ?',
      [email, employeeId || null]
    );

    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({
        error: 'User already exists with this email or employee ID'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const fullName = `${firstName} ${lastName}`;
    const userResult = await query(`
      INSERT INTO users (
        name, email, password, employee_id, department, role_id, 
        phone, address, date_of_birth, hire_date, salary, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [
      fullName, email, hashedPassword, employeeId || null,
      department || null, roleId || 1, null, null, null, 
      joinDate ? new Date(joinDate) : null, null
    ]);

    // Get the created user with role information
    const insertId = (userResult.rows as any).insertId;
    const newUserResult = await query(`
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ?
    `, [insertId]);

    const user = newUserResult.rows[0];

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employee_id,
        department: user.department,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.date_of_birth,
        hireDate: user.hire_date,
        salary: user.salary,
        role: {
          id: user.role_id,
          name: user.role_name,
          description: user.role_description
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error during registration'
    });
  }
});

// User login
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userResult = await query(`
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.is_active = true
    `, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate tokens
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role_name 
      },
      secret,
      { expiresIn: expiresIn as string }
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      secret,
      { expiresIn: refreshExpiresIn as string }
    );

    // Update last login (add updated_at to the update)
    await query(
      'UPDATE users SET updated_at = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employee_id,
        department: user.department,
        phone: user.phone,
        role: {
          id: user.role_id,
          name: user.role_name,
          description: user.role_description
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login'
    });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required'
      });
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, secret) as any;

    // Get user
    const userResult = await query(`
      SELECT u.*, r.name as role_name
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ? AND u.is_active = true
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    const user = userResult.rows[0];

    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role_name 
      },
      secret,
      { expiresIn: expiresIn as string }
    );

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role_id,
          name: user.role_name
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Invalid refresh token'
    });
  }
});

// Get current user
router.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const userResult = await query(`
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ? AND u.is_active = true
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employee_id,
        department: user.department,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.date_of_birth,
        hireDate: user.hire_date,
        salary: user.salary,
        role: {
          id: user.role_id,
          name: user.role_name,
          description: user.role_description
        }
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Logout
router.post('/logout', authenticateJWT, async (req: Request, res: Response) => {
  try {
    // In a more complex implementation, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;

