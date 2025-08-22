import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CustomError } from "../middleware/errorHandler";
import { prisma } from "../config/prisma";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  role: "admin" | "student" | "staff";
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface AuthResponse {
  user: {
    user_id: number;
    email: string;
    role: string;
    first_name?: string;
    last_name?: string;
  };
  token: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = parseInt(
    process.env.BCRYPT_ROUNDS || "12"
  );
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET ||
    "vertex-learn-super-secret-jwt-key-change-in-production-2024";
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: {
    user_id: number;
    email: string;
    role: string;
  }): string {
    return jwt.sign(
      payload,
      this.JWT_SECRET as string,
      {
        expiresIn: this.JWT_EXPIRES_IN,
      } as jwt.SignOptions
    );
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    return jwt.verify(token, this.JWT_SECRET as string);
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new CustomError("User with this email already exists", 409);
      }

      // Hash password
      const password_hash = await this.hashPassword(userData.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          ...userData,
          password_hash,
        },
      });

      // Generate token
      const token = this.generateToken({
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
          first_name: user.first_name ?? undefined,
          last_name: user.last_name ?? undefined,
        },
        token,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Registration failed", 500);
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        throw new CustomError("Invalid email or password", 401);
      }

      // Check if account is active
      if (!user.is_active) {
        throw new CustomError("Account is deactivated", 401);
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(
        credentials.password,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new CustomError("Invalid email or password", 401);
      }

      // Update last login
      await prisma.user.update({
        where: { user_id: user.user_id },
        data: { last_login: new Date() },
      });

      // Generate token
      const token = this.generateToken({
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
          first_name: user.first_name ?? undefined,
          last_name: user.last_name ?? undefined,
        },
        token,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Login failed", 500);
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(
        currentPassword,
        user.password_hash
      );

      if (!isCurrentPasswordValid) {
        throw new CustomError("Current password is incorrect", 401);
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { user_id: userId },
        data: { password_hash: newPasswordHash },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Password change failed", 500);
    }
  }

  /**
   * Reset password (admin only)
   */
  static async resetPassword(
    userId: number,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { user_id: userId },
        data: { password_hash: newPasswordHash },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Password reset failed", 500);
    }
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(userId: number): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      await prisma.user.update({
        where: { user_id: userId },
        data: { is_active: false },
      });
    } catch (error) {
      throw new CustomError("Account deactivation failed", 500);
    }
  }

  /**
   * Activate user account
   */
  static async activateUser(userId: number): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      await prisma.user.update({
        where: { user_id: userId },
        data: { is_active: true },
      });
    } catch (error) {
      throw new CustomError("Account activation failed", 500);
    }
  }
}
