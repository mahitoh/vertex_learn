"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grade = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Grade extends sequelize_1.Model {
    calculateLetterGrade() {
        if (this.score >= 90) {
            this.letter_grade = 'A';
            this.grade_points = 4.0;
        }
        else if (this.score >= 80) {
            this.letter_grade = 'B';
            this.grade_points = 3.0;
        }
        else if (this.score >= 70) {
            this.letter_grade = 'C';
            this.grade_points = 2.0;
        }
        else if (this.score >= 60) {
            this.letter_grade = 'D';
            this.grade_points = 1.0;
        }
        else {
            this.letter_grade = 'F';
            this.grade_points = 0.0;
        }
    }
}
exports.Grade = Grade;
Grade.init({
    grade_id: {
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
    score: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: 0,
            max: 100,
        },
    },
    letter_grade: {
        type: sequelize_1.DataTypes.STRING(2),
        allowNull: true,
    },
    grade_points: {
        type: sequelize_1.DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
            min: 0.0,
            max: 4.0,
        },
    },
    assessment_type: {
        type: sequelize_1.DataTypes.ENUM('exam', 'quiz', 'assignment', 'project', 'final'),
        allowNull: false,
    },
    assessment_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    comments: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'grades',
    modelName: 'Grade',
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
            fields: ['assessment_type'],
        },
        {
            fields: ['assessment_date'],
        },
        {
            unique: true,
            fields: ['student_id', 'course_id', 'assessment_type'],
            name: 'unique_student_course_assessment',
        },
    ],
    hooks: {
        beforeSave: (grade) => {
            grade.calculateLetterGrade();
        },
    },
});
exports.default = Grade;
//# sourceMappingURL=Grade.js.map