import { sequelize } from '../config/database';

// Import all models
import User from './User';
import Student from './Student';
import Course from './Course';
import Grade from './Grade';
import Attendance from './Attendance';
import Exam from './Exam';
import Invoice from './Invoice';
import Expense from './Expense';
import Campaign from './Campaign';
import Employee from './Employee';
import Leave from './Leave';
import Asset from './Asset';
import Payroll from './Payroll';

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasOne(Student, { foreignKey: 'user_id', as: 'student' });
  User.hasOne(Employee, { foreignKey: 'user_id', as: 'employee' });

  // Student associations
  Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Student.hasMany(Grade, { foreignKey: 'student_id', as: 'grades' });
  Student.hasMany(Attendance, { foreignKey: 'student_id', as: 'attendance' });
  Student.hasMany(Invoice, { foreignKey: 'student_id', as: 'invoices' });

  // Course associations
  Course.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });
  Course.hasMany(Grade, { foreignKey: 'course_id', as: 'grades' });
  Course.hasMany(Attendance, { foreignKey: 'course_id', as: 'attendance' });
  Course.hasMany(Exam, { foreignKey: 'course_id', as: 'exams' });

  // Grade associations
  Grade.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  Grade.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

  // Attendance associations
  Attendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  Attendance.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
  Attendance.belongsTo(User, { foreignKey: 'marked_by', as: 'marker' });

  // Exam associations
  Exam.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

  // Invoice associations
  Invoice.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  // Expense associations
  Expense.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

  // Employee associations
  Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Employee.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
  Employee.hasMany(Employee, { foreignKey: 'manager_id', as: 'subordinates' });
  Employee.hasMany(Leave, { foreignKey: 'employee_id', as: 'leaves' });
  Employee.hasMany(Asset, { foreignKey: 'assigned_to', as: 'assets' });
  Employee.hasMany(Payroll, { foreignKey: 'employee_id', as: 'payrolls' });

  // Leave associations
  Leave.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  Leave.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

  // Asset associations
  Asset.belongsTo(Employee, { foreignKey: 'assigned_to', as: 'assignee' });

  // Payroll associations
  Payroll.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
};

// Setup associations
setupAssociations();

// Export all models
export {
  sequelize,
  User,
  Student,
  Course,
  Grade,
  Attendance,
  Exam,
  Invoice,
  Expense,
  Campaign,
  Employee,
  Leave,
  Asset,
  Payroll,
};

// Export default object with all models
export default {
  sequelize,
  User,
  Student,
  Course,
  Grade,
  Attendance,
  Exam,
  Invoice,
  Expense,
  Campaign,
  Employee,
  Leave,
  Asset,
  Payroll,
};
