"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attendance = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Attendance extends sequelize_1.Model {
}
exports.Attendance = Attendance;
Attendance.init({
    attendance_id: {
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
    course_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'course_id',
        },
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('present', 'absent', 'late', 'excused'),
        allowNull: false,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    marked_by: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id',
        },
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'attendance',
    modelName: 'Attendance',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['student_id'],
        },
        {
            fields: ['course_id'],
        },
        {
            fields: ['date'],
        },
        {
            fields: ['status'],
        },
        {
            unique: true,
            fields: ['student_id', 'course_id', 'date'],
            name: 'unique_student_course_date',
        },
    ],
});
exports.default = Attendance;
//# sourceMappingURL=Attendance.js.map