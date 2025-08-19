"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.originalUrl} not found`,
            statusCode: 404,
        },
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=notFoundHandler.js.map