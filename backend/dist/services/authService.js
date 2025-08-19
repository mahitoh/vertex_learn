"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthService {
    static async hashPassword(password) {
        return bcrypt_1.default.hash(password, this.SALT_ROUNDS);
    }
    static async comparePassword(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
        });
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
    }
    static async register(userData) {
        try {
            const existingUser = await models_1.User.findOne({
                where: { email: userData.email },
            });
            if (existingUser) {
                throw new errorHandler_1.CustomError("User with this email already exists", 409);
            }
            const password_hash = await this.hashPassword(userData.password);
            const user = await models_1.User.create({
                ...userData,
                password_hash,
            });
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
                    first_name: user.first_name,
                    last_name: user.last_name,
                },
                token,
            };
        }
        catch (error) {
            if (error instanceof errorHandler_1.CustomError) {
                throw error;
            }
            throw new errorHandler_1.CustomError("Registration failed", 500);
        }
    }
    static async login(credentials) {
        try {
            const user = await models_1.User.findOne({
                where: { email: credentials.email },
            });
            if (!user) {
                throw new errorHandler_1.CustomError("Invalid email or password", 401);
            }
            if (!user.is_active) {
                throw new errorHandler_1.CustomError("Account is deactivated", 401);
            }
            const isPasswordValid = await this.comparePassword(credentials.password, user.password_hash);
            if (!isPasswordValid) {
                throw new errorHandler_1.CustomError("Invalid email or password", 401);
            }
            await user.update({ last_login: new Date() });
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
                    first_name: user.first_name,
                    last_name: user.last_name,
                },
                token,
            };
        }
        catch (error) {
            if (error instanceof errorHandler_1.CustomError) {
                throw error;
            }
            throw new errorHandler_1.CustomError("Login failed", 500);
        }
    }
    static async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new errorHandler_1.CustomError("User not found", 404);
            }
            const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password_hash);
            if (!isCurrentPasswordValid) {
                throw new errorHandler_1.CustomError("Current password is incorrect", 401);
            }
            const newPasswordHash = await this.hashPassword(newPassword);
            await user.update({ password_hash: newPasswordHash });
        }
        catch (error) {
            if (error instanceof errorHandler_1.CustomError) {
                throw error;
            }
            throw new errorHandler_1.CustomError("Password change failed", 500);
        }
    }
    static async resetPassword(userId, newPassword) {
        try {
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new errorHandler_1.CustomError("User not found", 404);
            }
            const newPasswordHash = await this.hashPassword(newPassword);
            await user.update({ password_hash: newPasswordHash });
        }
        catch (error) {
            if (error instanceof errorHandler_1.CustomError) {
                throw error;
            }
            throw new errorHandler_1.CustomError("Password reset failed", 500);
        }
    }
    static async deactivateUser(userId) {
        try {
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new errorHandler_1.CustomError("User not found", 404);
            }
            await user.update({ is_active: false });
        }
        catch (error) {
            throw new errorHandler_1.CustomError("Account deactivation failed", 500);
        }
    }
    static async activateUser(userId) {
        try {
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new errorHandler_1.CustomError("User not found", 404);
            }
            await user.update({ is_active: true });
        }
        catch (error) {
            throw new errorHandler_1.CustomError("Account activation failed", 500);
        }
    }
}
exports.AuthService = AuthService;
AuthService.SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");
AuthService.JWT_SECRET = process.env.JWT_SECRET ||
    "vertex-learn-super-secret-jwt-key-change-in-production-2024";
AuthService.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
//# sourceMappingURL=authService.js.map