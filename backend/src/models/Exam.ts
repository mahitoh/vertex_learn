import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Exam:
 *       type: object
 *       required:
 *         - course_id
 *         - title
 *         - exam_date
 *         - exam_type
 *       properties:
 *         exam_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         course_id:
 *           type: integer
 *           description: Reference to course
 *         title:
 *           type: string
 *           description: Exam title
 *         description:
 *           type: string
 *           description: Exam description
 *         exam_date:
 *           type: string
 *           format: date-time
 *           description: Date and time of exam
 *         duration_minutes:
 *           type: integer
 *           description: Exam duration in minutes
 *         total_marks:
 *           type: number
 *           format: float
 *           description: Total marks for the exam
 *         exam_type:
 *           type: string
 *           enum: [midterm, final, quiz, practical]
 *           description: Type of exam
 *         location:
 *           type: string
 *           description: Exam location/room
 *         instructions:
 *           type: string
 *           description: Special instructions for the exam
 *         is_published:
 *           type: boolean
 *           description: Whether exam schedule is published
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface ExamAttributes {
  exam_id: number;
  course_id: number;
  title: string;
  description?: string;
  exam_date: Date;
  duration_minutes?: number;
  total_marks?: number;
  exam_type: 'midterm' | 'final' | 'quiz' | 'practical';
  location?: string;
  instructions?: string;
  is_published: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface ExamCreationAttributes extends Optional<ExamAttributes, 'exam_id' | 'is_published' | 'created_at' | 'updated_at'> {}

export class Exam extends Model<ExamAttributes, ExamCreationAttributes> implements ExamAttributes {
  public exam_id!: number;
  public course_id!: number;
  public title!: string;
  public description?: string;
  public exam_date!: Date;
  public duration_minutes?: number;
  public total_marks?: number;
  public exam_type!: 'midterm' | 'final' | 'quiz' | 'practical';
  public location?: string;
  public instructions?: string;
  public is_published!: boolean;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Exam.init(
  {
    exam_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'course_id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    exam_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 15,
        max: 480, // 8 hours max
      },
    },
    total_marks: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    exam_type: {
      type: DataTypes.ENUM('midterm', 'final', 'quiz', 'practical'),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'exams',
    modelName: 'Exam',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['course_id'],
      },
      {
        fields: ['exam_date'],
      },
      {
        fields: ['exam_type'],
      },
      {
        fields: ['is_published'],
      },
    ],
  }
);

export default Exam;
