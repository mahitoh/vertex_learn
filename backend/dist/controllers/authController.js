"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const authService_1 = require("../services/authService");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const { email, password, role, first_name, last_name, phone } = req.body;
    const result = await authService_1.AuthService.register({
        email,
        password,
        role,
        first_name,
        last_name,
        phone,
    });
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
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
AuthController.login = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const { email, password } = req.body;
    const result = await authService_1.AuthService.login({ email, password });
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
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
AuthController.logout = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: 'Logout successful',
    });
});
AuthController.getCurrentUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
    });
});
AuthController.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { currentPassword, newPassword } = req.body;
    await authService_1.AuthService.changePassword(req.user.user_id, currentPassword, newPassword);
    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
    });
});
AuthController.resetPassword = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const { userId } = req.params;
    const { newPassword } = req.body;
    await authService_1.AuthService.resetPassword(parseInt(userId), newPassword);
    res.status(200).json({
        success: true,
        message: 'Password reset successfully',
    });
});
AuthController.deactivateUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { userId } = req.params;
    await authService_1.AuthService.deactivateUser(parseInt(userId));
    res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
    });
});
AuthController.activateUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { userId } = req.params;
    await authService_1.AuthService.activateUser(parseInt(userId));
    res.status(200).json({
        success: true,
        message: 'User activated successfully',
    });
});
//# sourceMappingURL=authController.js.map