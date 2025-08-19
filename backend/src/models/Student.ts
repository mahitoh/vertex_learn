import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - user_id
 *         - student_number
 *       properties:
 *         student_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         user_id:
 *           type: integer
 *           description: Reference to user account
 *         student_number:
 *           type: string
 *           description: Unique student identification number
 *         program:
 *           type: string
 *           description: Academic program/major
 *         year_level:
 *           type: integer
 *           description: Current year level (1-4)
 *         enrollment_date:
 *           type: string
 *           format: date
 *           description: Date of enrollment
 *         graduation_date:
 *           type: string
 *           format: date
 *           description: Expected or actual graduation date
 *         gpa:
 *           type: number
 *           format: float
 *           description: Current GPA
 *         status:
 *           type: string
 *           enum: [active, inactive, graduated, suspended]
 *           description: Student status
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface StudentAttributes {
  student_id: number;
  user_id: number;
  student_number: string;
  program?: string;
  year_level?: number;
  enrollment_date?: Date;
  graduation_date?: Date;
  gpa?: number;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  created_at?: Date;
  updated_at?: Date;
}

export interface StudentCreationAttributes extends Optional<StudentAttributes, 'student_id' | 'status' | 'created_at' | 'updated_at'> {}

export class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  public student_id!: number;
  public user_id!: number;
  public student_number!: string;
  public program?: string;
  public year_level?: number;
  public enrollment_date?: Date;
  public graduation_date?: Date;
  public gpa?: number;
  public status!: 'active' | 'inactive' | 'graduated' | 'suspended';

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Student.init(
  {
    student_id: {
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
    student_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    program: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    year_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 4,
      },
    },
    enrollment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    graduation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gpa: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0.0,
        max: 4.0,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'students',
    modelName: 'Student',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id'],
      },
      {
        unique: true,
        fields: ['student_number'],
      },
      {
        fields: ['program'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['year_level'],
      },
    ],
  }
);

export default Student;
