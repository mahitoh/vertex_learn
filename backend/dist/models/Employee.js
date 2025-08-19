"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Employee extends sequelize_1.Model {
    get years_of_service() {
        if (!this.hire_date)
            return 0;
        const today = new Date();
        const hireDate = new Date(this.hire_date);
        return Math.floor((today.getTime() - hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }
}
exports.Employee = Employee;
Employee.init({
    employee_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'user_id',
        },
    },
    employee_number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    department: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    position: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    hire_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    salary: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0,
        },
    },
    employment_type: {
        type: sequelize_1.DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'),
        allowNull: false,
        defaultValue: 'full_time',
    },
    manager_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'employees',
            key: 'employee_id',
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'terminated', 'on_leave'),
        allowNull: false,
        defaultValue: 'active',
    },
    emergency_contact: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'employees',
    modelName: 'Employee',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id'],
        },
        {
            unique: true,
            fields: ['employee_number'],
        },
        {
            fields: ['department'],
        },
        {
            fields: ['position'],
        },
        {
            fields: ['status'],
        },
        {
            fields: ['manager_id'],
        },
    ],
});
exports.default = Employee;
//# sourceMappingURL=Employee.js.map