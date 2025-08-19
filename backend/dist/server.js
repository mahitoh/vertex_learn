"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const academic_1 = __importDefault(require("./routes/academic"));
const finance_1 = __importDefault(require("./routes/finance"));
const hr_1 = __importDefault(require("./routes/hr"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vertex Learn ERP API',
            version: '1.0.0',
            description: 'A comprehensive ERP system for educational institutions',
            contact: {
                name: 'Vertex Learn Team',
                email: 'support@vertexlearn.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
            {
                cookieAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'],
};
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(limiter);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Vertex Learn ERP API Documentation',
}));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/academic', academic_1.default);
app.use('/api/finance', finance_1.default);
app.use('/api/hr', hr_1.default);
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await database_1.sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        if (process.env.NODE_ENV === 'development') {
            await database_1.sequelize.sync({ alter: true });
            console.log('✅ Database models synchronized.');
        }
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
            console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await database_1.sequelize.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await database_1.sequelize.close();
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map