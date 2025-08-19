import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       required:
 *         - name
 *         - asset_type
 *         - asset_tag
 *       properties:
 *         asset_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: Asset name
 *         description:
 *           type: string
 *           description: Asset description
 *         asset_type:
 *           type: string
 *           enum: [computer, furniture, equipment, vehicle, software, other]
 *           description: Type of asset
 *         asset_tag:
 *           type: string
 *           description: Unique asset identification tag
 *         serial_number:
 *           type: string
 *           description: Serial number
 *         purchase_date:
 *           type: string
 *           format: date
 *           description: Date of purchase
 *         purchase_price:
 *           type: number
 *           format: float
 *           description: Purchase price
 *         current_value:
 *           type: number
 *           format: float
 *           description: Current estimated value
 *         assigned_to:
 *           type: integer
 *           description: ID of employee assigned to
 *         location:
 *           type: string
 *           description: Physical location of asset
 *         status:
 *           type: string
 *           enum: [available, assigned, maintenance, retired, lost]
 *           description: Asset status
 *         warranty_expiry:
 *           type: string
 *           format: date
 *           description: Warranty expiry date
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface AssetAttributes {
  asset_id: number;
  name: string;
  description?: string;
  asset_type: 'computer' | 'furniture' | 'equipment' | 'vehicle' | 'software' | 'other';
  asset_tag: string;
  serial_number?: string;
  purchase_date?: Date;
  purchase_price?: number;
  current_value?: number;
  assigned_to?: number;
  location?: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost';
  warranty_expiry?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface AssetCreationAttributes extends Optional<AssetAttributes, 'asset_id' | 'status' | 'created_at' | 'updated_at'> {}

export class Asset extends Model<AssetAttributes, AssetCreationAttributes> implements AssetAttributes {
  public asset_id!: number;
  public name!: string;
  public description?: string;
  public asset_type!: 'computer' | 'furniture' | 'equipment' | 'vehicle' | 'software' | 'other';
  public asset_tag!: string;
  public serial_number?: string;
  public purchase_date?: Date;
  public purchase_price?: number;
  public current_value?: number;
  public assigned_to?: number;
  public location?: string;
  public status!: 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost';
  public warranty_expiry?: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Calculate depreciation
  public get depreciation(): number {
    if (!this.purchase_price || !this.current_value) return 0;
    return this.purchase_price - this.current_value;
  }

  // Check if warranty is still valid
  public get is_under_warranty(): boolean {
    if (!this.warranty_expiry) return false;
    return new Date() < new Date(this.warranty_expiry);
  }
}

Asset.init(
  {
    asset_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    asset_type: {
      type: DataTypes.ENUM('computer', 'furniture', 'equipment', 'vehicle', 'software', 'other'),
      allowNull: false,
    },
    asset_tag: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    serial_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    current_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'employee_id',
      },
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('available', 'assigned', 'maintenance', 'retired', 'lost'),
      allowNull: false,
      defaultValue: 'available',
    },
    warranty_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'assets',
    modelName: 'Asset',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['asset_tag'],
      },
      {
        fields: ['asset_type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['assigned_to'],
      },
      {
        fields: ['location'],
      },
    ],
  }
);

export default Asset;
