import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password_hash
 *         - role
 *       properties:
 *         user_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password_hash:
 *           type: string
 *           description: Hashed password
 *         role:
 *           type: string
 *           enum: [admin, student, staff]
 *           description: User role for access control
 *         first_name:
 *           type: string
 *           description: User's first name
 *         last_name:
 *           type: string
 *           description: User's last name
 *         phone:
 *           type: string
 *           description: User's phone number
 *         is_active:
 *           type: boolean
 *           description: Whether the user account is active
 *         last_login:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface UserAttributes {
  user_id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'student' | 'staff';
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'user_id' | 'is_active' | 'created_at' | 'updated_at'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public user_id!: number;
  public email!: string;
  public password_hash!: string;
  public role!: 'admin' | 'student' | 'staff';
  public first_name?: string;
  public last_name?: string;
  public phone?: string;
  public is_active!: boolean;
  public last_login?: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Virtual fields
  public get full_name(): string {
    return `${this.first_name || ''} ${this.last_name || ''}`.trim();
  }
}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'student', 'staff'),
      allowNull: false,
      defaultValue: 'student',
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

export default User;
