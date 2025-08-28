import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { asyncHandler, CustomError } from '../middleware/errorHandler';

export class AuthController {
  /**
   * Register new user
   */
  static register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array().map((e: any) => ({ field: e.path ?? e.param, message: e.msg })),
        },
      });
      return;
    }

    const { email, password, role, first_name, last_name, phone } = req.body;

    const result = await AuthService.register({
      email,
      password,
      role,
      first_name,
      last_name,
      phone,
    });

    // Set HTTP-only cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array().map((e: any) => ({ field: e.path ?? e.param, message: e.msg })),
        },
      });
      return;
    }

    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    // Set HTTP-only cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  });

  /**
   * Logout user
   */
  static logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Clear cookie
    res.clearCookie('token');

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  });

  /**
   * Get current user
   */
  static getCurrentUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new CustomError('User not authenticated', 401);
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  });

  /**
   * Change password
   */
  static changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError('Validation failed', 400);
    }

    if (!req.user) {
      throw new CustomError('User not authenticated', 401);
    }

    const { currentPassword, newPassword } = req.body;

    await AuthService.changePassword(req.user.user_id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  /**
   * Reset password (admin only)
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError('Validation failed', 400);
    }

    const { userId } = req.params;
    const { newPassword } = req.body;

    await AuthService.resetPassword(parseInt(userId), newPassword);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  });

  /**
   * Deactivate user (admin only)
   */
  static deactivateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    await AuthService.deactivateUser(parseInt(userId));

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  });

  /**
   * Activate user (admin only)
   */
  static activateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    await AuthService.activateUser(parseInt(userId));

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
    });
  });
}
