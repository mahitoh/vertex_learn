"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payroll = exports.Asset = exports.Leave = exports.Employee = exports.Campaign = exports.Expense = exports.Invoice = exports.Exam = exports.Attendance = exports.Grade = exports.Course = exports.Student = exports.User = exports.sequelize = void 0;
const database_1 = require("../config/database");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return database_1.sequelize; } });
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Student_1 = __importDefault(require("./Student"));
exports.Student = Student_1.default;
const Course_1 = __importDefault(require("./Course"));
exports.Course = Course_1.default;
const Grade_1 = __importDefault(require("./Grade"));
exports.Grade = Grade_1.default;
const Attendance_1 = __importDefault(require("./Attendance"));
exports.Attendance = Attendance_1.default;
const Exam_1 = __importDefault(require("./Exam"));
exports.Exam = Exam_1.default;
const Invoice_1 = __importDefault(require("./Invoice"));
exports.Invoice = Invoice_1.default;
const Expense_1 = __importDefault(require("./Expense"));
exports.Expense = Expense_1.default;
const Campaign_1 = __importDefault(require("./Campaign"));
exports.Campaign = Campaign_1.default;
const Employee_1 = __importDefault(require("./Employee"));
exports.Employee = Employee_1.default;
const Leave_1 = __importDefault(require("./Leave"));
exports.Leave = Leave_1.default;
const Asset_1 = __importDefault(require("./Asset"));
exports.Asset = Asset_1.default;
const Payroll_1 = __importDefault(require("./Payroll"));
exports.Payroll = Payroll_1.default;
const setupAssociations = () => {
    User_1.default.hasOne(Student_1.default, { foreignKey: 'user_id', as: 'student' });
    User_1.default.hasOne(Employee_1.default, { foreignKey: 'user_id', as: 'employee' });
    Student_1.default.belongsTo(User_1.default, { foreignKey: 'user_id', as: 'user' });
    Student_1.default.hasMany(Grade_1.default, { foreignKey: 'student_id', as: 'grades' });
    Student_1.default.hasMany(Attendance_1.default, { foreignKey: 'student_id', as: 'attendance' });
    Student_1.default.hasMany(Invoice_1.default, { foreignKey: 'student_id', as: 'invoices' });
    Course_1.default.belongsTo(User_1.default, { foreignKey: 'instructor_id', as: 'instructor' });
    Course_1.default.hasMany(Grade_1.default, { foreignKey: 'course_id', as: 'grades' });
    Course_1.default.hasMany(Attendance_1.default, { foreignKey: 'course_id', as: 'attendance' });
    Course_1.default.hasMany(Exam_1.default, { foreignKey: 'course_id', as: 'exams' });
    Grade_1.default.belongsTo(Student_1.default, { foreignKey: 'student_id', as: 'student' });
    Grade_1.default.belongsTo(Course_1.default, { foreignKey: 'course_id', as: 'course' });
    Attendance_1.default.belongsTo(Student_1.default, { foreignKey: 'student_id', as: 'student' });
    Attendance_1.default.belongsTo(Course_1.default, { foreignKey: 'course_id', as: 'course' });
    Attendance_1.default.belongsTo(User_1.default, { foreignKey: 'marked_by', as: 'marker' });
    Exam_1.default.belongsTo(Course_1.default, { foreignKey: 'course_id', as: 'course' });
    Invoice_1.default.belongsTo(Student_1.default, { foreignKey: 'student_id', as: 'student' });
    Expense_1.default.belongsTo(User_1.default, { foreignKey: 'approved_by', as: 'approver' });
    Employee_1.default.belongsTo(User_1.default, { foreignKey: 'user_id', as: 'user' });
    Employee_1.default.belongsTo(Employee_1.default, { foreignKey: 'manager_id', as: 'manager' });
    Employee_1.default.hasMany(Employee_1.default, { foreignKey: 'manager_id', as: 'subordinates' });
    Employee_1.default.hasMany(Leave_1.default, { foreignKey: 'employee_id', as: 'leaves' });
    Employee_1.default.hasMany(Asset_1.default, { foreignKey: 'assigned_to', as: 'assets' });
    Employee_1.default.hasMany(Payroll_1.default, { foreignKey: 'employee_id', as: 'payrolls' });
    Leave_1.default.belongsTo(Employee_1.default, { foreignKey: 'employee_id', as: 'employee' });
    Leave_1.default.belongsTo(User_1.default, { foreignKey: 'approved_by', as: 'approver' });
    Asset_1.default.belongsTo(Employee_1.default, { foreignKey: 'assigned_to', as: 'assignee' });
    Payroll_1.default.belongsTo(Employee_1.default, { foreignKey: 'employee_id', as: 'employee' });
};
setupAssociations();
exports.default = {
    sequelize: database_1.sequelize,
    User: User_1.default,
    Student: Student_1.default,
    Course: Course_1.default,
    Grade: Grade_1.default,
    Attendance: Attendance_1.default,
    Exam: Exam_1.default,
    Invoice: Invoice_1.default,
    Expense: Expense_1.default,
    Campaign: Campaign_1.default,
    Employee: Employee_1.default,
    Leave: Leave_1.default,
    Asset: Asset_1.default,
    Payroll: Payroll_1.default,
};
//# sourceMappingURL=index.js.map