"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.createError = exports.CustomError = void 0;
const sequelize_1 = require("sequelize");
class CustomError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
const createError = (message, statusCode = 500) => {
    return new CustomError(message, statusCode);
};
exports.createError = createError;
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    if (error instanceof sequelize_1.ValidationError) {
        statusCode = 400;
        message = error.errors.map(err => err.message).join(', ');
    }
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        message = 'Resource already exists';
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        message = 'Invalid reference to related resource';
    }
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: error.message,
            stack: error.stack,
            statusCode,
            url: req.url,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        });
    }
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                details: error,
            }),
        },
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map