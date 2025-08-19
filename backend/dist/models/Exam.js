"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exam = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Exam extends sequelize_1.Model {
}
exports.Exam = Exam;
Exam.init({
    exam_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    course_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'course_id',
        },
    },
    title: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    exam_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    duration_minutes: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 15,
            max: 480,
        },
    },
    total_marks: {
        type: sequelize_1.DataTypes.DECIMAL(6, 2),
        allowNull: true,
        validate: {
            min: 0,
        },
    },
    exam_type: {
        type: sequelize_1.DataTypes.ENUM('midterm', 'final', 'quiz', 'practical'),
        allowNull: false,
    },
    location: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    instructions: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    is_published: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'exams',
    modelName: 'Exam',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['course_id'],
        },
        {
            fields: ['exam_date'],
        },
        {
            fields: ['exam_type'],
        },
        {
            fields: ['is_published'],
        },
    ],
});
exports.default = Exam;
//# sourceMappingURL=Exam.js.map