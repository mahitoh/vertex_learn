"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = exports.testConnection = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { DB_HOST = 'localhost', DB_PORT = '5432', DB_NAME = 'vertex_learn', DB_USER = 'postgres', DB_PASSWORD = 'password', NODE_ENV = 'development', USE_SQLITE = 'false', } = process.env;
const resolvedDialect = USE_SQLITE === 'true' ? 'sqlite' : 'postgres';
const baseOptions = {
    host: DB_HOST,
    port: parseInt(DB_PORT),
    dialect: resolvedDialect,
    logging: NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    },
    timezone: '+00:00',
    ...(USE_SQLITE === 'true' ? { storage: './database.sqlite' } : {}),
};
exports.sequelize = USE_SQLITE === 'true'
    ? new sequelize_1.Sequelize(baseOptions)
    : new sequelize_1.Sequelize(DB_NAME, DB_USER, DB_PASSWORD, baseOptions);
const testConnection = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');
        return true;
    }
    catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        if (USE_SQLITE === 'true') {
            console.log('💡 Trying to create SQLite database...');
            try {
                await exports.sequelize.sync({ force: true });
                console.log('✅ SQLite database created successfully.');
                return true;
            }
            catch (syncError) {
                console.error('❌ Failed to create SQLite database:', syncError);
                return false;
            }
        }
        return false;
    }
};
exports.testConnection = testConnection;
const closeConnection = async () => {
    try {
        await exports.sequelize.close();
        console.log('✅ Database connection closed successfully.');
    }
    catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
};
exports.closeConnection = closeConnection;
exports.default = exports.sequelize;
//# sourceMappingURL=database.js.map