import { body, param } from 'express-validator';

/**
 * Validation rules for user registration
 */
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .isIn(['admin', 'student', 'staff'])
    .withMessage('Role must be admin, student, or staff'),
  
  body('first_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  
  body('last_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
];

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for password change
 */
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

/**
 * Validation rules for password reset
 */
export const validateResetPassword = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

/**
 * Validation rules for user ID parameter
 */
export const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];

/**
 * Validation rules for course creation
 */
export const validateCourse = [
  body('name')
    .notEmpty()
    .isLength({ min: 1, max: 255 })
    .withMessage('Course name is required and must be less than 255 characters'),
  
  body('code')
    .notEmpty()
    .isLength({ min: 1, max: 20 })
    .withMessage('Course code is required and must be less than 20 characters'),
  
  body('credits')
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('instructor_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Instructor ID must be a positive integer'),
  
  body('semester')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Semester must be less than 20 characters'),
  
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
];

/**
 * Validation rules for grade creation
 */
export const validateGrade = [
  body('student_id')
    .isInt({ min: 1 })
    .withMessage('Student ID must be a positive integer'),
  
  body('course_id')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  
  body('score')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  
  body('assessment_type')
    .isIn(['exam', 'quiz', 'assignment', 'project', 'final'])
    .withMessage('Assessment type must be exam, quiz, assignment, project, or final'),
  
  body('assessment_date')
    .optional()
    .isISO8601()
    .withMessage('Assessment date must be a valid date'),
  
  body('comments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comments must be less than 1000 characters'),
];

/**
 * Validation rules for attendance
 */
export const validateAttendance = [
  body('student_id')
    .isInt({ min: 1 })
    .withMessage('Student ID must be a positive integer'),
  
  body('course_id')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  
  body('status')
    .isIn(['present', 'absent', 'late', 'excused'])
    .withMessage('Status must be present, absent, late, or excused'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
];
