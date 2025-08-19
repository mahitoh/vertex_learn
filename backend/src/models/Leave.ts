import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Leave:
 *       type: object
 *       required:
 *         - employee_id
 *         - leave_type
 *         - start_date
 *         - end_date
 *       properties:
 *         leave_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         employee_id:
 *           type: integer
 *           description: Reference to employee
 *         leave_type:
 *           type: string
 *           enum: [annual, sick, maternity, paternity, emergency, unpaid]
 *           description: Type of leave
 *         start_date:
 *           type: string
 *           format: date
 *           description: Leave start date
 *         end_date:
 *           type: string
 *           format: date
 *           description: Leave end date
 *         days_requested:
 *           type: integer
 *           description: Number of days requested
 *         reason:
 *           type: string
 *           description: Reason for leave
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *           description: Leave request status
 *         approved_by:
 *           type: integer
 *           description: ID of user who approved the leave
 *         approval_date:
 *           type: string
 *           format: date-time
 *           description: Date when leave was approved
 *         comments:
 *           type: string
 *           description: Additional comments
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface LeaveAttributes {
  leave_id: number;
  employee_id: number;
  leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid';
  start_date: Date;
  end_date: Date;
  days_requested?: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: number;
  approval_date?: Date;
  comments?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface LeaveCreationAttributes extends Optional<LeaveAttributes, 'leave_id' | 'status' | 'created_at' | 'updated_at'> {}

export class Leave extends Model<LeaveAttributes, LeaveCreationAttributes> implements LeaveAttributes {
  public leave_id!: number;
  public employee_id!: number;
  public leave_type!: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid';
  public start_date!: Date;
  public end_date!: Date;
  public days_requested?: number;
  public reason?: string;
  public status!: 'pending' | 'approved' | 'rejected' | 'cancelled';
  public approved_by?: number;
  public approval_date?: Date;
  public comments?: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Calculate number of days
  public calculateDays(): number {
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  }
}

Leave.init(
  {
    leave_id: {
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
    leave_type: {
      type: DataTypes.ENUM('annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid'),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    days_requested: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'leaves',
    modelName: 'Leave',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['employee_id'],
      },
      {
        fields: ['leave_type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['start_date'],
      },
      {
        fields: ['end_date'],
      },
      {
        fields: ['approved_by'],
      },
    ],
    hooks: {
      beforeSave: (leave: Leave) => {
        if (!leave.days_requested) {
          leave.days_requested = leave.calculateDays();
        }
      },
    },
  }
);

export default Leave;
