import { Router, Request, Response } from "express";
import bcrypt from 'bcrypt';
import db from "../config/database.js";

const router = Router();

// Debug endpoint to check database structure
router.get('/db-structure', async (req: Request, res: Response) => {
  try {
    // Check users table structure
    const usersStructure = await db.query('DESCRIBE users');
    
    // Check if admin user exists
    const adminUser = await db.query('SELECT * FROM users WHERE email = ?', ['admin@vertexlearn.com']);
    
    // Check roles table
    const roles = await db.query('SELECT * FROM roles');
    
    res.json({
      usersStructure: usersStructure.rows,
      adminUser: adminUser.rows,
      roles: roles.rows
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create test users endpoint
router.post('/create-test-users', async (req: Request, res: Response) => {
  try {
    // Create some test users with pending status
    const testUsers = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: await bcrypt.hash('password123', 10),
        role_id: 2, // teacher
        employee_id: 'EMP001',
        department: 'Mathematics',
        validation_status: 'pending'
      },
      {
        name: 'Mike Chen',
        email: 'mike.chen@example.com',
        password: await bcrypt.hash('password123', 10),
        role_id: 4, // staff
        employee_id: 'STF002',
        department: 'IT',
        validation_status: 'pending'
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@example.com',
        password: await bcrypt.hash('password123', 10),
        role_id: 2, // teacher
        employee_id: 'TCH003',
        department: 'English',
        validation_status: 'pending'
      },
      {
        name: 'David Kim',
        email: 'david.kim@example.com',
        password: await bcrypt.hash('password123', 10),
        role_id: 3, // student
        employee_id: 'STU004',
        department: 'Computer Science',
        validation_status: 'pending'
      }
    ];

    const createdUsers = [];
    for (const user of testUsers) {
      // Check if user already exists
      const existing = await db.query('SELECT id FROM users WHERE email = ?', [user.email]);
      
      if (existing.rows.length === 0) {
        const result = await db.query(`
          INSERT INTO users (name, email, password, role_id, employee_id, department, validation_status, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [user.name, user.email, user.password, user.role_id, user.employee_id, user.department, user.validation_status, true]);
        
        createdUsers.push({
          id: result.rows.insertId,
          ...user,
          password: '[hidden]'
        });
      }
    }

    res.json({
      message: 'Test users created successfully',
      users: createdUsers
    });
  } catch (error) {
    console.error('Create test users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create admin user endpoint
router.post('/create-admin', async (req: Request, res: Response) => {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.query('SELECT * FROM users WHERE email = ?', ['admin@vertexlearn.com']);
    
    if (existingAdmin.rows.length > 0) {
      // Update existing admin to be approved
      await db.query(
        'UPDATE users SET validation_status = ?, is_active = ? WHERE email = ?',
        ['approved', true, 'admin@vertexlearn.com']
      );
      
      return res.json({
        message: 'Admin user updated to approved status',
        user: existingAdmin.rows[0]
      });
    }
    
    // Get admin role ID
    const adminRole = await db.query('SELECT * FROM roles WHERE name = ?', ['admin']);
    
    if (adminRole.rows.length === 0) {
      return res.status(400).json({ error: 'Admin role not found' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const result = await db.query(`
      INSERT INTO users (
        name, email, password, role_id, validation_status, is_active, employee_id, department
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'System Administrator',
      'admin@vertexlearn.com',
      hashedPassword,
      adminRole.rows[0].id,
      'approved',
      true,
      'ADMIN001',
      'Administration'
    ]);
    
    res.json({
      message: 'Admin user created successfully',
      userId: result.rows.insertId,
      email: 'admin@vertexlearn.com',
      password: 'admin123'
    });
    
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;