import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - credits
 *       properties:
 *         course_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: Course name
 *         code:
 *           type: string
 *           description: Course code (e.g., CS101)
 *         description:
 *           type: string
 *           description: Course description
 *         credits:
 *           type: integer
 *           description: Number of credits for the course
 *         instructor_id:
 *           type: integer
 *           description: ID of the instructor (staff user)
 *         semester:
 *           type: string
 *           description: Semester when course is offered
 *         year:
 *           type: integer
 *           description: Year when course is offered
 *         is_active:
 *           type: boolean
 *           description: Whether the course is currently active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface CourseAttributes {
  course_id: number;
  name: string;
  code: string;
  description?: string;
  credits: number;
  instructor_id?: number;
  semester?: string;
  year?: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CourseCreationAttributes extends Optional<CourseAttributes, 'course_id' | 'is_active' | 'created_at' | 'updated_at'> {}

export class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  public course_id!: number;
  public name!: string;
  public code!: string;
  public description?: string;
  public credits!: number;
  public instructor_id?: number;
  public semester?: string;
  public year?: number;
  public is_active!: boolean;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Course.init(
  {
    course_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    instructor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    semester: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 2020,
        max: 2030,
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'courses',
    modelName: 'Course',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['code'],
      },
      {
        fields: ['instructor_id'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['semester', 'year'],
      },
    ],
  }
);

export default Course;
