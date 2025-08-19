import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - amount
 *         - category
 *         - description
 *       properties:
 *         expense_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         amount:
 *           type: number
 *           format: float
 *           description: Expense amount
 *         category:
 *           type: string
 *           enum: [utilities, salaries, supplies, maintenance, marketing, other]
 *           description: Expense category
 *         description:
 *           type: string
 *           description: Expense description
 *         expense_date:
 *           type: string
 *           format: date
 *           description: Date of expense
 *         vendor:
 *           type: string
 *           description: Vendor or supplier name
 *         receipt_number:
 *           type: string
 *           description: Receipt or invoice number
 *         payment_method:
 *           type: string
 *           description: Payment method used
 *         approved_by:
 *           type: integer
 *           description: ID of user who approved the expense
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, paid]
 *           description: Expense status
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface ExpenseAttributes {
  expense_id: number;
  amount: number;
  category: 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'marketing' | 'other';
  description: string;
  expense_date?: Date;
  vendor?: string;
  receipt_number?: string;
  payment_method?: string;
  approved_by?: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  created_at?: Date;
  updated_at?: Date;
}

export interface ExpenseCreationAttributes extends Optional<ExpenseAttributes, 'expense_id' | 'status' | 'created_at' | 'updated_at'> {}

export class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> implements ExpenseAttributes {
  public expense_id!: number;
  public amount!: number;
  public category!: 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'marketing' | 'other';
  public description!: string;
  public expense_date?: Date;
  public vendor?: string;
  public receipt_number?: string;
  public payment_method?: string;
  public approved_by?: number;
  public status!: 'pending' | 'approved' | 'rejected' | 'paid';

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Expense.init(
  {
    expense_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    category: {
      type: DataTypes.ENUM('utilities', 'salaries', 'supplies', 'maintenance', 'marketing', 'other'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expense_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    vendor: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    receipt_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'expenses',
    modelName: 'Expense',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['category'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['expense_date'],
      },
      {
        fields: ['approved_by'],
      },
    ],
  }
);

export default Expense;
