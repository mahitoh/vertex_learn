"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireStudentAccess = exports.requireStaffOrAdmin = exports.requireAdmin = exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const errorHandler_1 = require("./errorHandler");
const authenticateToken = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        if (!token && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            throw new errorHandler_1.CustomError('Access token required', 401);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await models_1.User.findByPk(decoded.user_id, {
            attributes: ['user_id', 'email', 'role', 'first_name', 'last_name', 'is_active'],
        });
        if (!user) {
            throw new errorHandler_1.CustomError('User not found', 401);
        }
        if (!user.is_active) {
            throw new errorHandler_1.CustomError('Account is deactivated', 401);
        }
        req.user = {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.CustomError('Invalid token', 401));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errorHandler_1.CustomError('Token expired', 401));
        }
        else {
            next(error);
        }
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new errorHandler_1.CustomError('Authentication required', 401);
        }
        if (!roles.includes(req.user.role)) {
            throw new errorHandler_1.CustomError('Insufficient permissions', 403);
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
exports.requireAdmin = (0, exports.authorizeRoles)('admin');
exports.requireStaffOrAdmin = (0, exports.authorizeRoles)('staff', 'admin');
const requireStudentAccess = (req, res, next) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('Authentication required', 401);
    }
    const { role, user_id } = req.user;
    const requestedUserId = parseInt(req.params.userId || req.params.id);
    if (role === 'admin' || role === 'staff') {
        return next();
    }
    if (role === 'student' && user_id === requestedUserId) {
        return next();
    }
    throw new errorHandler_1.CustomError('Access denied', 403);
};
exports.requireStudentAccess = requireStudentAccess;
const optionalAuth = async (req, res, next) => {
    try {
        await (0, exports.authenticateToken)(req, res, next);
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map