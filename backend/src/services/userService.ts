import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// User Service
export class UserService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateToken(userId: number): Promise<string> {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    
    return jwt.sign({ userId }, secret, { expiresIn: expiresIn as string });
  }

  static async verifyToken(token: string): Promise<any> {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    return jwt.verify(token, secret);
  }

  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
  }

  static async findUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
  }

  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    roleId: number;
    department?: string;
    employeeId?: string;
  }) {
    const hashedPassword = await this.hashPassword(userData.password);
    
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      },
      include: { role: true }
    });
  }

  static async updateUser(id: number, userData: {
    name?: string;
    email?: string;
    department?: string;
    roleId?: number;
  }) {
    return prisma.user.update({
      where: { id },
      data: userData,
      include: { role: true }
    });
  }

  static async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id }
    });
  }

  static async getUsersWithPagination(params: {
    search?: string;
    department?: string;
    page: number;
    limit: number;
  }) {
    const { search, department, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }
}

// Notification Service
export class NotificationService {
  static async createNotification(data: {
    message: string;
    recipientId: number;
    senderId: number;
  }) {
    return prisma.notification.create({
      data,
      include: {
        recipient: {
          select: { id: true, name: true, email: true }
        },
        sender: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  static async markAsRead(notificationId: number, userId: number) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId: userId
      },
      data: { status: 'read' }
    });
  }

  static async getUnreadCount(userId: number) {
    return prisma.notification.count({
      where: {
        recipientId: userId,
        status: 'unread'
      }
    });
  }
}

// PDF Service
export class PDFService {
  static async generatePayslip(payrollData: any): Promise<Buffer> {
    // This would use pdfkit to generate a payslip PDF
    // For now, return a placeholder
    return Buffer.from('PDF placeholder');
  }

  static async generateInvoice(invoiceData: any): Promise<Buffer> {
    // This would use pdfkit to generate an invoice PDF
    // For now, return a placeholder
    return Buffer.from('PDF placeholder');
  }
}
