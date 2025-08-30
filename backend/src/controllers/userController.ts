import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// User Controller
export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const { search, department, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { employeeId: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      if (department) {
        where.department = { contains: department as string, mode: 'insensitive' };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            role: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
          role: true
        }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, roleId, department, employeeId } = req.body;

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password, // Note: Should be hashed in service layer
          roleId: Number(roleId),
          department,
          employeeId
        },
        include: {
          role: true
        }
      });

      res.status(201).json({ success: true, data: user });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, department, roleId } = req.body;

      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          name,
          email,
          department,
          roleId: roleId ? Number(roleId) : undefined
        },
        include: {
          role: true
        }
      });

      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id: Number(id) }
      });

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
