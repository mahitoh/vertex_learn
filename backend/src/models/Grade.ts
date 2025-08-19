import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       required:
 *         - student_id
 *         - course_id
 *         - score
 *       properties:
 *         grade_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         student_id:
 *           type: integer
 *           description: Reference to student
 *         course_id:
 *           type: integer
 *           description: Reference to course
 *         score:
 *           type: number
 *           format: float
 *           description: Numerical score (0-100)
 *         letter_grade:
 *           type: string
 *           description: Letter grade (A, B, C, D, F)
 *         grade_points:
 *           type: number
 *           format: float
 *           description: Grade points for GPA calculation
 *         assessment_type:
 *           type: string
 *           enum: [exam, quiz, assignment, project, final]
 *           description: Type of assessment
 *         assessment_date:
 *           type: string
 *           format: date
 *           description: Date of assessment
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

export interface GradeAttributes {
  grade_id: number;
  student_id: number;
  course_id: number;
  score: number;
  letter_grade?: string;
  grade_points?: number;
  assessment_type: 'exam' | 'quiz' | 'assignment' | 'project' | 'final';
  assessment_date?: Date;
  comments?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface GradeCreationAttributes extends Optional<GradeAttributes, 'grade_id' | 'created_at' | 'updated_at'> {}

export class Grade extends Model<GradeAttributes, GradeCreationAttributes> implements GradeAttributes {
  public grade_id!: number;
  public student_id!: number;
  public course_id!: number;
  public score!: number;
  public letter_grade?: string;
  public grade_points?: number;
  public assessment_type!: 'exam' | 'quiz' | 'assignment' | 'project' | 'final';
  public assessment_date?: Date;
  public comments?: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Method to calculate letter grade and grade points
  public calculateLetterGrade(): void {
    if (this.score >= 90) {
      this.letter_grade = 'A';
      this.grade_points = 4.0;
    } else if (this.score >= 80) {
      this.letter_grade = 'B';
      this.grade_points = 3.0;
    } else if (this.score >= 70) {
      this.letter_grade = 'C';
      this.grade_points = 2.0;
    } else if (this.score >= 60) {
      this.letter_grade = 'D';
      this.grade_points = 1.0;
    } else {
      this.letter_grade = 'F';
      this.grade_points = 0.0;
    }
  }
}

Grade.init(
  {
    grade_id: {
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
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'course_id',
      },
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    letter_grade: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    grade_points: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0.0,
        max: 4.0,
      },
    },
    assessment_type: {
      type: DataTypes.ENUM('exam', 'quiz', 'assignment', 'project', 'final'),
      allowNull: false,
    },
    assessment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'grades',
    modelName: 'Grade',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['student_id'],
      },
      {
        fields: ['course_id'],
      },
      {
        fields: ['assessment_type'],
      },
      {
        fields: ['assessment_date'],
      },
      {
        unique: true,
        fields: ['student_id', 'course_id', 'assessment_type'],
        name: 'unique_student_course_assessment',
      },
    ],
    hooks: {
      beforeSave: (grade: Grade) => {
        grade.calculateLetterGrade();
      },
    },
  }
);

export default Grade;
