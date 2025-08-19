"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Invoice extends sequelize_1.Model {
    static generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        return `INV-${year}-${timestamp}`;
    }
}
exports.Invoice = Invoice;
Invoice.init({
    invoice_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    student_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'student_id',
        },
    },
    invoice_number: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    invoice_type: {
        type: sequelize_1.DataTypes.ENUM('tuition', 'fees', 'library', 'laboratory', 'other'),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    due_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    payment_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    payment_method: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    transaction_id: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'invoices',
    modelName: 'Invoice',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['invoice_number'],
        },
        {
            fields: ['student_id'],
        },
        {
            fields: ['status'],
        },
        {
            fields: ['invoice_type'],
        },
        {
            fields: ['due_date'],
        },
    ],
    hooks: {
        beforeCreate: (invoice) => {
            if (!invoice.invoice_number) {
                invoice.invoice_number = Invoice.generateInvoiceNumber();
            }
        },
    },
});
exports.default = Invoice;
//# sourceMappingURL=Invoice.js.map