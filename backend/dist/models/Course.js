"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Course extends sequelize_1.Model {
}
exports.Course = Course;
Course.init({
    course_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    code: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    credits: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 10,
        },
    },
    instructor_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id',
        },
    },
    semester: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    year: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 2020,
            max: 2030,
        },
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'courses',
    modelName: 'Course',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['code'],
        },
        {
            fields: ['instructor_id'],
        },
        {
            fields: ['is_active'],
        },
        {
            fields: ['semester', 'year'],
        },
    ],
});
exports.default = Course;
//# sourceMappingURL=Course.js.map