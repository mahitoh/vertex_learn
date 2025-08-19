"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Expense extends sequelize_1.Model {
}
exports.Expense = Expense;
Expense.init({
    expense_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    category: {
        type: sequelize_1.DataTypes.ENUM('utilities', 'salaries', 'supplies', 'maintenance', 'marketing', 'other'),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    expense_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    vendor: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    receipt_number: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    payment_method: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    approved_by: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id',
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'),
        allowNull: false,
        defaultValue: 'pending',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'expenses',
    modelName: 'Expense',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['category'],
        },
        {
            fields: ['status'],
        },
        {
            fields: ['expense_date'],
        },
        {
            fields: ['approved_by'],
        },
    ],
});
exports.default = Expense;
//# sourceMappingURL=Expense.js.map