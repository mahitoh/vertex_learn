import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       required:
 *         - name
 *         - campaign_type
 *         - budget
 *       properties:
 *         campaign_id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: Campaign name
 *         description:
 *           type: string
 *           description: Campaign description
 *         campaign_type:
 *           type: string
 *           enum: [digital, print, social_media, email, event, other]
 *           description: Type of marketing campaign
 *         budget:
 *           type: number
 *           format: float
 *           description: Campaign budget
 *         spent:
 *           type: number
 *           format: float
 *           description: Amount spent on campaign
 *         leads:
 *           type: integer
 *           description: Number of leads generated
 *         conversions:
 *           type: integer
 *           description: Number of conversions
 *         start_date:
 *           type: string
 *           format: date
 *           description: Campaign start date
 *         end_date:
 *           type: string
 *           format: date
 *           description: Campaign end date
 *         status:
 *           type: string
 *           enum: [planning, active, paused, completed, cancelled]
 *           description: Campaign status
 *         target_audience:
 *           type: string
 *           description: Target audience description
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export interface CampaignAttributes {
  campaign_id: number;
  name: string;
  description?: string;
  campaign_type: 'digital' | 'print' | 'social_media' | 'email' | 'event' | 'other';
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  start_date?: Date;
  end_date?: Date;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  target_audience?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CampaignCreationAttributes extends Optional<CampaignAttributes, 'campaign_id' | 'spent' | 'leads' | 'conversions' | 'status' | 'created_at' | 'updated_at'> {}

export class Campaign extends Model<CampaignAttributes, CampaignCreationAttributes> implements CampaignAttributes {
  public campaign_id!: number;
  public name!: string;
  public description?: string;
  public campaign_type!: 'digital' | 'print' | 'social_media' | 'email' | 'event' | 'other';
  public budget!: number;
  public spent!: number;
  public leads!: number;
  public conversions!: number;
  public start_date?: Date;
  public end_date?: Date;
  public status!: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  public target_audience?: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Calculate ROI
  public get roi(): number {
    if (this.spent === 0) return 0;
    const revenue = this.conversions * 1000; // Assuming average revenue per conversion
    return ((revenue - this.spent) / this.spent) * 100;
  }

  // Calculate conversion rate
  public get conversion_rate(): number {
    if (this.leads === 0) return 0;
    return (this.conversions / this.leads) * 100;
  }
}

Campaign.init(
  {
    campaign_id: {
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
    campaign_type: {
      type: DataTypes.ENUM('digital', 'print', 'social_media', 'email', 'event', 'other'),
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    spent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    leads: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    conversions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('planning', 'active', 'paused', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planning',
    },
    target_audience: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'campaigns',
    modelName: 'Campaign',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['campaign_type'],
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
    ],
  }
);

export default Campaign;
