import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       required:
 *         - user_id
 *         - employee_number
 *         - department
 *         - position
 *       properties:
 *         employee_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         user_id:
 *           type: integer
 *           description: Reference to user account
 *         employee_number:
 *           type: string
 *           description: Unique employee identification number
 *         department:
 *           type: string
 *           description: Employee department
 *         position:
 *           type: string
 *           description: Job position/title
 *         hire_date:
 *           type: string
 *           format: date
 *           description: Date of hire
 *         salary:
 *           type: number
 *           format: float
 *           description: Employee salary
 *         employment_type:
 *           type: string
 *           enum: [full_time, part_time, contract, intern]
 *           description: Type of employment
 *         manager_id:
 *           type: integer
 *           description: ID of direct manager
 *         status:
 *           type: string
 *           enum: [active, inactive, terminated, on_leave]
 *           description: Employment status
 *         emergency_contact:
 *           type: string
 *           description: Emergency contact information
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface EmployeeAttributes {
  employee_id: number;
  user_id: number;
  employee_number: string;
  department: string;
  position: string;
  hire_date?: Date;
  salary?: number;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  manager_id?: number;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  emergency_contact?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'employee_id' | 'employment_type' | 'status' | 'created_at' | 'updated_at'> {}

export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
  public employee_id!: number;
  public user_id!: number;
  public employee_number!: string;
  public department!: string;
  public position!: string;
  public hire_date?: Date;
  public salary?: number;
  public employment_type!: 'full_time' | 'part_time' | 'contract' | 'intern';
  public manager_id?: number;
  public status!: 'active' | 'inactive' | 'terminated' | 'on_leave';
  public emergency_contact?: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Calculate years of service
  public get years_of_service(): number {
    if (!this.hire_date) return 0;
    const today = new Date();
    const hireDate = new Date(this.hire_date);
    return Math.floor((today.getTime() - hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }
}

Employee.init(
  {
    employee_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    employee_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    hire_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    employment_type: {
      type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'),
      allowNull: false,
      defaultValue: 'full_time',
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'employee_id',
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'terminated', 'on_leave'),
      allowNull: false,
      defaultValue: 'active',
    },
    emergency_contact: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'employees',
    modelName: 'Employee',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id'],
      },
      {
        unique: true,
        fields: ['employee_number'],
      },
      {
        fields: ['department'],
      },
      {
        fields: ['position'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['manager_id'],
      },
    ],
  }
);

export default Employee;
