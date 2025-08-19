import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Payroll:
 *       type: object
 *       required:
 *         - employee_id
 *         - pay_period_start
 *         - pay_period_end
 *         - gross_pay
 *       properties:
 *         payroll_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         employee_id:
 *           type: integer
 *           description: Reference to employee
 *         pay_period_start:
 *           type: string
 *           format: date
 *           description: Start date of pay period
 *         pay_period_end:
 *           type: string
 *           format: date
 *           description: End date of pay period
 *         gross_pay:
 *           type: number
 *           format: float
 *           description: Gross pay amount
 *         deductions:
 *           type: number
 *           format: float
 *           description: Total deductions
 *         net_pay:
 *           type: number
 *           format: float
 *           description: Net pay after deductions
 *         overtime_hours:
 *           type: number
 *           format: float
 *           description: Overtime hours worked
 *         overtime_pay:
 *           type: number
 *           format: float
 *           description: Overtime pay amount
 *         bonus:
 *           type: number
 *           format: float
 *           description: Bonus amount
 *         tax_deduction:
 *           type: number
 *           format: float
 *           description: Tax deduction amount
 *         insurance_deduction:
 *           type: number
 *           format: float
 *           description: Insurance deduction amount
 *         status:
 *           type: string
 *           enum: [draft, processed, paid]
 *           description: Payroll status
 *         pay_date:
 *           type: string
 *           format: date
 *           description: Date when payment was made
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface PayrollAttributes {
  payroll_id: number;
  employee_id: number;
  pay_period_start: Date;
  pay_period_end: Date;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  overtime_hours: number;
  overtime_pay: number;
  bonus: number;
  tax_deduction: number;
  insurance_deduction: number;
  status: 'draft' | 'processed' | 'paid';
  pay_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface PayrollCreationAttributes extends Optional<PayrollAttributes, 'payroll_id' | 'deductions' | 'net_pay' | 'overtime_hours' | 'overtime_pay' | 'bonus' | 'tax_deduction' | 'insurance_deduction' | 'status' | 'created_at' | 'updated_at'> {}

export class Payroll extends Model<PayrollAttributes, PayrollCreationAttributes> implements PayrollAttributes {
  public payroll_id!: number;
  public employee_id!: number;
  public pay_period_start!: Date;
  public pay_period_end!: Date;
  public gross_pay!: number;
  public deductions!: number;
  public net_pay!: number;
  public overtime_hours!: number;
  public overtime_pay!: number;
  public bonus!: number;
  public tax_deduction!: number;
  public insurance_deduction!: number;
  public status!: 'draft' | 'processed' | 'paid';
  public pay_date?: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Calculate net pay
  public calculateNetPay(): void {
    this.deductions = this.tax_deduction + this.insurance_deduction;
    this.net_pay = this.gross_pay + this.overtime_pay + this.bonus - this.deductions;
  }
}

Payroll.init(
  {
    payroll_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'employee_id',
      },
    },
    pay_period_start: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    pay_period_end: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gross_pay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    net_pay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    overtime_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    overtime_pay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    bonus: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    tax_deduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    insurance_deduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'processed', 'paid'),
      allowNull: false,
      defaultValue: 'draft',
    },
    pay_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'payroll',
    modelName: 'Payroll',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['employee_id'],
      },
      {
        fields: ['pay_period_start'],
      },
      {
        fields: ['pay_period_end'],
      },
      {
        fields: ['status'],
      },
      {
        unique: true,
        fields: ['employee_id', 'pay_period_start', 'pay_period_end'],
        name: 'unique_employee_pay_period',
      },
    ],
    hooks: {
      beforeSave: (payroll: Payroll) => {
        payroll.calculateNetPay();
      },
    },
  }
);

export default Payroll;
