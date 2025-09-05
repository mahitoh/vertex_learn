import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationError } from 'express-validator';

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err: ValidationError) => ({
      field: (err as any).path || (err as any).param,
      message: err.msg,
      value: (err as any).value
    }));
    return res.status(400).json({ errors: formattedErrors });
  }
  next();
};

// Authentication validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('organization')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization must be between 2 and 100 characters'),
  handleValidationErrors
];

// User management validation
export const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be between 2 and 100 characters'),
  handleValidationErrors
];

// Course validation
export const validateCourse = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course name must be between 3 and 100 characters'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Course code must be between 2 and 20 characters'),
  body('credits')
    .isInt({ min: 1, max: 30 })
    .withMessage('Credits must be between 1 and 30'),
  body('instructorId')
    .isInt({ min: 1 })
    .withMessage('Valid instructor ID is required'),
  handleValidationErrors
];

// Grade validation
export const validateGrade = [
  body('studentId')
    .isInt({ min: 1 })
    .withMessage('Valid student ID is required'),
  body('courseId')
    .isInt({ min: 1 })
    .withMessage('Valid course ID is required'),
  body('assignmentType')
    .isIn(['assignment', 'exam', 'quiz', 'final'])
    .withMessage('Assignment type must be one of: assignment, exam, quiz, final'),
  body('score')
    .isFloat({ min: 0 })
    .withMessage('Score must be a non-negative number'),
  body('maxScore')
    .isFloat({ min: 1 })
    .withMessage('Maximum score must be greater than 0'),
  handleValidationErrors
];

// Leave validation
export const validateLeave = [
  body('type')
    .isIn(['Annual', 'Sick', 'Personal'])
    .withMessage('Leave type must be one of: Annual, Sick, Personal'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('days')
    .isInt({ min: 1 })
    .withMessage('Days must be a positive integer'),
  handleValidationErrors
];

// Payroll validation
export const validatePayroll = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  body('payPeriod')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Pay period must be in YYYY-MM format'),
  body('baseSalary')
    .isFloat({ min: 0 })
    .withMessage('Base salary must be a non-negative number'),
  body('bonuses')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bonuses must be a non-negative number'),
  body('deductions')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deductions must be a non-negative number'),
  handleValidationErrors
];

// Asset validation
export const validateAsset = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Asset name must be between 2 and 100 characters'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('status')
    .isIn(['available', 'assigned', 'low'])
    .withMessage('Status must be one of: available, assigned, low'),
  body('purchaseDate')
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  handleValidationErrors
];

// Invoice validation
export const validateInvoice = [
  body('studentId')
    .isInt({ min: 1 })
    .withMessage('Valid student ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Description must be between 5 and 200 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// ID parameter validation - using manual validation to avoid path-to-regexp conflicts
export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
    return res.status(400).json({
      errors: [{ field: 'id', message: 'ID must be a positive integer', value: id }]
    });
  }
  next();
};

// Expense validation
export const validateExpense = [
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Description must be between 5 and 200 characters'),
  handleValidationErrors
];

// Campaign validation
export const validateCampaign = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Campaign name must be between 2 and 100 characters'),
  body('leads')
    .isInt({ min: 0 })
    .withMessage('Leads must be a non-negative integer'),
  body('conversions')
    .isInt({ min: 0 })
    .withMessage('Conversions must be a non-negative integer'),
  body('roi')
    .isFloat({ min: 0 })
    .withMessage('ROI must be a non-negative number'),
  handleValidationErrors
];

// Notification validation
export const validateNotification = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('recipientId')
    .isInt({ min: 1 })
    .withMessage('Valid recipient ID is required'),
  handleValidationErrors
];

// Setting validation
export const validateSetting = [
  body('key')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Key must be between 1 and 100 characters'),
  body('value')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Value must be between 1 and 1000 characters'),
  handleValidationErrors
];

