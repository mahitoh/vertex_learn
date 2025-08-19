"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Leave = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Leave extends sequelize_1.Model {
    calculateDays() {
        const start = new Date(this.start_date);
        const end = new Date(this.end_date);
        const timeDiff = end.getTime() - start.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    }
}
exports.Leave = Leave;
Leave.init({
    leave_id: {
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
    leave_type: {
        type: sequelize_1.DataTypes.ENUM('annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid'),
        allowNull: false,
    },
    start_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    end_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    days_requested: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
        },
    },
    reason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    approved_by: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id',
        },
    },
    approval_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    comments: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'leaves',
    modelName: 'Leave',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['employee_id'],
        },
        {
            fields: ['leave_type'],
        },
        {
            fields: ['status'],
        },
        {
            fields: ['start_date'],
        },
        {
            fields: ['end_date'],
        },
        {
            fields: ['approved_by'],
        },
    ],
    hooks: {
        beforeSave: (leave) => {
            if (!leave.days_requested) {
                leave.days_requested = leave.calculateDays();
            }
        },
    },
});
exports.default = Leave;
//# sourceMappingURL=Leave.js.map