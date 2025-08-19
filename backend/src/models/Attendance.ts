import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - student_id
 *         - course_id
 *         - date
 *         - status
 *       properties:
 *         attendance_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         student_id:
 *           type: integer
 *           description: Reference to student
 *         course_id:
 *           type: integer
 *           description: Reference to course
 *         date:
 *           type: string
 *           format: date
 *           description: Date of class
 *         status:
 *           type: string
 *           enum: [present, absent, late, excused]
 *           description: Attendance status
 *         notes:
 *           type: string
 *           description: Additional notes
 *         marked_by:
 *           type: integer
 *           description: ID of user who marked attendance
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface AttendanceAttributes {
  attendance_id: number;
  student_id: number;
  course_id: number;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  marked_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'attendance_id' | 'created_at' | 'updated_at'> {}

export class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
  public attendance_id!: number;
  public student_id!: number;
  public course_id!: number;
  public date!: Date;
  public status!: 'present' | 'absent' | 'late' | 'excused';
  public notes?: string;
  public marked_by?: number;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Attendance.init(
  {
    attendance_id: {
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    marked_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
  },
  {
    sequelize,
    tableName: 'attendance',
    modelName: 'Attendance',
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
        fields: ['date'],
      },
      {
        fields: ['status'],
      },
      {
        unique: true,
        fields: ['student_id', 'course_id', 'date'],
        name: 'unique_student_course_date',
      },
    ],
  }
);

export default Attendance;
