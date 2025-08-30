import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { validateLogin, validateRegistration } from '../middleware/validation.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// User registration
router.post('/register', validateRegistration, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, employeeId, studentId, department, position, joinDate, admissionDate, class: className, rollNumber, organization, roleId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(employeeId ? [{ employeeId }] : []),
          ...(studentId ? [{ studentId }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email, employee ID, or student ID'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        employeeId,
        studentId,
        department,
        position,
        joinDate: joinDate ? new Date(joinDate) : undefined,
        admissionDate: admissionDate ? new Date(admissionDate) : undefined,
        class: className,
        rollNumber,
        organization,
        roleId: roleId || 1, // Default to basic role
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeId: true,
        studentId: true,
        department: true,
        position: true,
        joinDate: true,
        admissionDate: true,
        class: true,
        rollNumber: true,
        organization: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user
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
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { employeeId: email },
          { studentId: email }
        ],
        isActive: true
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT tokens
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role.name,
        permissions: user.role.permissions
      }, 
      secret as string, 
      { expiresIn: expiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id }, 
      secret as string, 
      { expiresIn: refreshExpiresIn }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken
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
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role.name,
        permissions: user.role.permissions
      }, 
      secret, 
      { expiresIn }
    );

    res.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeId: true,
        studentId: true,
        department: true,
        position: true,
        joinDate: true,
        admissionDate: true,
        class: true,
        rollNumber: true,
        organization: true,
        lastLogin: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching profile'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateJWT, async (req: any, res: Response) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error during logout'
    });
  }
});

export default router;

