"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class User extends sequelize_1.Model {
    get full_name() {
        return `${this.first_name || ''} ${this.last_name || ''}`.trim();
    }
}
exports.User = User;
User.init({
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password_hash: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('admin', 'student', 'staff'),
        allowNull: false,
        defaultValue: 'student',
    },
    first_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    last_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    last_login: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['email'],
        },
        {
            fields: ['role'],
        },
        {
            fields: ['is_active'],
        },
    ],
});
exports.default = User;
//# sourceMappingURL=User.js.map