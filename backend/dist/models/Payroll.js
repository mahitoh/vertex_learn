"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payroll = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Payroll extends sequelize_1.Model {
    calculateNetPay() {
        this.deductions = this.tax_deduction + this.insurance_deduction;
        this.net_pay = this.gross_pay + this.overtime_pay + this.bonus - this.deductions;
    }
}
exports.Payroll = Payroll;
Payroll.init({
    payroll_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    employee_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'employees',
            key: 'employee_id',
        },
    },
    pay_period_start: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    pay_period_end: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    gross_pay: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    deductions: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    net_pay: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    overtime_hours: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    overtime_pay: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    bonus: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    tax_deduction: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    insurance_deduction: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('draft', 'processed', 'paid'),
        allowNull: false,
        defaultValue: 'draft',
    },
    pay_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'payroll',
    modelName: 'Payroll',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['employee_id'],
        },
        {
            fields: ['pay_period_start'],
        },
        {
            fields: ['pay_period_end'],
        },
        {
            fields: ['status'],
        },
        {
            unique: true,
            fields: ['employee_id', 'pay_period_start', 'pay_period_end'],
            name: 'unique_employee_pay_period',
        },
    ],
    hooks: {
        beforeSave: (payroll) => {
            payroll.calculateNetPay();
        },
    },
});
exports.default = Payroll;
//# sourceMappingURL=Payroll.js.map