"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAttendance = exports.validateGrade = exports.validateCourse = exports.validateUserId = exports.validateResetPassword = exports.validateChangePassword = exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegister = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    (0, express_validator_1.body)('role')
        .isIn(['admin', 'student', 'staff'])
        .withMessage('Role must be admin, student, or staff'),
    (0, express_validator_1.body)('first_name')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('last_name')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Last name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
exports.validateChangePassword = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
];
exports.validateResetPassword = [
    (0, express_validator_1.param)('userId')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
];
exports.validateUserId = [
    (0, express_validator_1.param)('userId')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),
];
exports.validateCourse = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .isLength({ min: 1, max: 255 })
        .withMessage('Course name is required and must be less than 255 characters'),
    (0, express_validator_1.body)('code')
        .notEmpty()
        .isLength({ min: 1, max: 20 })
        .withMessage('Course code is required and must be less than 20 characters'),
    (0, express_validator_1.body)('credits')
        .isInt({ min: 1, max: 10 })
        .withMessage('Credits must be between 1 and 10'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    (0, express_validator_1.body)('instructor_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Instructor ID must be a positive integer'),
    (0, express_validator_1.body)('semester')
        .optional()
        .isLength({ max: 20 })
        .withMessage('Semester must be less than 20 characters'),
    (0, express_validator_1.body)('year')
        .optional()
        .isInt({ min: 2020, max: 2030 })
        .withMessage('Year must be between 2020 and 2030'),
];
exports.validateGrade = [
    (0, express_validator_1.body)('student_id')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),
    (0, express_validator_1.body)('course_id')
        .isInt({ min: 1 })
        .withMessage('Course ID must be a positive integer'),
    (0, express_validator_1.body)('score')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Score must be between 0 and 100'),
    (0, express_validator_1.body)('assessment_type')
        .isIn(['exam', 'quiz', 'assignment', 'project', 'final'])
        .withMessage('Assessment type must be exam, quiz, assignment, project, or final'),
    (0, express_validator_1.body)('assessment_date')
        .optional()
        .isISO8601()
        .withMessage('Assessment date must be a valid date'),
    (0, express_validator_1.body)('comments')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Comments must be less than 1000 characters'),
];
exports.validateAttendance = [
    (0, express_validator_1.body)('student_id')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),
    (0, express_validator_1.body)('course_id')
        .isInt({ min: 1 })
        .withMessage('Course ID must be a positive integer'),
    (0, express_validator_1.body)('date')
        .isISO8601()
        .withMessage('Date must be a valid date'),
    (0, express_validator_1.body)('status')
        .isIn(['present', 'absent', 'late', 'excused'])
        .withMessage('Status must be present, absent, late, or excused'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes must be less than 500 characters'),
];
//# sourceMappingURL=validation.js.map