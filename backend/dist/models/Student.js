"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Student = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Student extends sequelize_1.Model {
}
exports.Student = Student;
Student.init({
    student_id: {
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
    student_number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    program: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    year_level: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 4,
        },
    },
    enrollment_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    graduation_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    gpa: {
        type: sequelize_1.DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
            min: 0.0,
            max: 4.0,
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'students',
    modelName: 'Student',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id'],
        },
        {
            unique: true,
            fields: ['student_number'],
        },
        {
            fields: ['program'],
        },
        {
            fields: ['status'],
        },
        {
            fields: ['year_level'],
        },
    ],
});
exports.default = Student;
//# sourceMappingURL=Student.js.map