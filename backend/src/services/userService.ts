import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

// User Service
export class UserService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateToken(userId: number): Promise<string> {
    const secret = process.env.JWT_SECRET || "fallback-secret";
    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

    return jwt.sign({ userId }, secret, { expiresIn: expiresIn as any });
  }

  static async verifyToken(token: string): Promise<any> {
    const secret = process.env.JWT_SECRET || "fallback-secret";
    return jwt.verify(token, secret);
  }

  static async findUserByEmail(email: string) {
    const { rows } = await query(
      `SELECT u.*, r.name as role_name, o.name as organization_name, o.code as organization_code
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       LEFT JOIN organizations o ON u.organization_id = o.id 
       WHERE u.email = ?`,
      [email]
    );
    return (rows as any[])[0];
  }

  static async findUserById(id: number) {
    const { rows } = await query(
      `SELECT u.*, r.name as role_name, o.name as organization_name, o.code as organization_code
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       LEFT JOIN organizations o ON u.organization_id = o.id 
       WHERE u.id = ?`,
      [id]
    );
    return (rows as any[])[0];
  }

  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    roleId: number;
    organizationId?: number;
    department?: string;
    employeeId?: string;
  }) {
    const hashedPassword = await this.hashPassword(userData.password);

    const result = await query(
      "INSERT INTO users (name, email, password, role_id, organization_id, department, employee_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [
        userData.name,
        userData.email,
        hashedPassword,
        userData.roleId,
        userData.organizationId,
        userData.department,
        userData.employeeId,
      ]
    );

    return this.findUserById(
      (result.rows as any).insertId || (result as any).insertId
    );
  }

  static async updateUser(
    id: number,
    userData: {
      name?: string;
      email?: string;
      department?: string;
      roleId?: number;
      organizationId?: number;
    }
  ) {
    const updateFields = [];
    const values = [];

    if (userData.name) {
      updateFields.push("name = ?");
      values.push(userData.name);
    }
    if (userData.email) {
      updateFields.push("email = ?");
      values.push(userData.email);
    }
    if (userData.department) {
      updateFields.push("department = ?");
      values.push(userData.department);
    }
    if (userData.roleId) {
      updateFields.push("role_id = ?");
      values.push(userData.roleId);
    }
    if (userData.organizationId !== undefined) {
      updateFields.push("organization_id = ?");
      values.push(userData.organizationId);
    }

    updateFields.push("updated_at = NOW()");
    values.push(id);

    await query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    return this.findUserById(id);
  }

  static async deleteUser(id: number) {
    await query("DELETE FROM users WHERE id = ?", [id]);
    return { success: true };
  }

  static async getUsersWithPagination(params: {
    search?: string;
    department?: string;
    page: number;
    limit: number;
  }) {
    const { search, department, page, limit } = params;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const values = [];

    if (search) {
      whereClause +=
        " AND (u.name LIKE ? OR u.email LIKE ? OR u.employee_id LIKE ?)";
      const searchTerm = `%${search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }
    if (department) {
      whereClause += " AND u.department LIKE ?";
      values.push(`%${department}%`);
    }

    const [usersResult, totalResult] = await Promise.all([
      query(
        `SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id ${whereClause} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        [...values, limit, offset]
      ),
      query(`SELECT COUNT(*) as total FROM users u ${whereClause}`, values),
    ]);

    const total = (totalResult.rows as any[])[0].total;

    return {
      users: usersResult.rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
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
    const result = await query(
      'INSERT INTO notifications (message, recipient_id, sender_id, status, created_at) VALUES (?, ?, ?, "unread", NOW())',
      [data.message, data.recipientId, data.senderId]
    );

    return this.getNotificationById(
      (result.rows as any).insertId || (result as any).insertId
    );
  }

  static async getNotificationById(id: number) {
    const { rows } = await query(
      `SELECT n.*, 
              r.name as recipient_name, r.email as recipient_email,
              s.name as sender_name, s.email as sender_email
       FROM notifications n 
       LEFT JOIN users r ON n.recipient_id = r.id 
       LEFT JOIN users s ON n.sender_id = s.id 
       WHERE n.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async markAsRead(notificationId: number, userId: number) {
    await query(
      'UPDATE notifications SET status = "read" WHERE id = ? AND recipient_id = ?',
      [notificationId, userId]
    );
    return { success: true };
  }

  static async getUnreadCount(userId: number) {
    const { rows } = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND status = "unread"',
      [userId]
    );
    return rows[0].count;
  }
}

// PDF Service
export class PDFService {
  static async generatePayslip(payrollData: any): Promise<Buffer> {
    // This would use pdfkit to generate a payslip PDF
    // For now, return a placeholder
    return Buffer.from("PDF placeholder");
  }

  static async generateInvoice(invoiceData: any): Promise<Buffer> {
    // This would use pdfkit to generate an invoice PDF
    // For now, return a placeholder
    return Buffer.from("PDF placeholder");
  }
}
