import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       required:
 *         - student_id
 *         - amount
 *         - invoice_type
 *       properties:
 *         invoice_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         student_id:
 *           type: integer
 *           description: Reference to student
 *         invoice_number:
 *           type: string
 *           description: Unique invoice number
 *         amount:
 *           type: number
 *           format: float
 *           description: Invoice amount
 *         invoice_type:
 *           type: string
 *           enum: [tuition, fees, library, laboratory, other]
 *           description: Type of invoice
 *         description:
 *           type: string
 *           description: Invoice description
 *         due_date:
 *           type: string
 *           format: date
 *           description: Payment due date
 *         status:
 *           type: string
 *           enum: [pending, paid, overdue, cancelled]
 *           description: Payment status
 *         payment_date:
 *           type: string
 *           format: date-time
 *           description: Date when payment was made
 *         payment_method:
 *           type: string
 *           description: Payment method used
 *         transaction_id:
 *           type: string
 *           description: Transaction reference ID
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface InvoiceAttributes {
  invoice_id: number;
  student_id: number;
  invoice_number: string;
  amount: number;
  invoice_type: 'tuition' | 'fees' | 'library' | 'laboratory' | 'other';
  description?: string;
  due_date?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: Date;
  payment_method?: string;
  transaction_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface InvoiceCreationAttributes extends Optional<InvoiceAttributes, 'invoice_id' | 'invoice_number' | 'status' | 'created_at' | 'updated_at'> {}

export class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
  public invoice_id!: number;
  public student_id!: number;
  public invoice_number!: string;
  public amount!: number;
  public invoice_type!: 'tuition' | 'fees' | 'library' | 'laboratory' | 'other';
  public description?: string;
  public due_date?: Date;
  public status!: 'pending' | 'paid' | 'overdue' | 'cancelled';
  public payment_date?: Date;
  public payment_method?: string;
  public transaction_id?: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Method to generate invoice number
  public static generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${year}-${timestamp}`;
  }
}

Invoice.init(
  {
    invoice_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'student_id',
      },
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    invoice_type: {
      type: DataTypes.ENUM('tuition', 'fees', 'library', 'laboratory', 'other'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'invoices',
    modelName: 'Invoice',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['invoice_number'],
      },
      {
        fields: ['student_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['invoice_type'],
      },
      {
        fields: ['due_date'],
      },
    ],
    hooks: {
      beforeCreate: (invoice: Invoice) => {
        if (!invoice.invoice_number) {
          invoice.invoice_number = Invoice.generateInvoiceNumber();
        }
      },
    },
  }
);

export default Invoice;
