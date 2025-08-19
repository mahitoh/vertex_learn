import { Model, Optional } from 'sequelize';
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
export interface CampaignCreationAttributes extends Optional<CampaignAttributes, 'campaign_id' | 'spent' | 'leads' | 'conversions' | 'status' | 'created_at' | 'updated_at'> {
}
export declare class Campaign extends Model<CampaignAttributes, CampaignCreationAttributes> implements CampaignAttributes {
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
    readonly created_at: Date;
    readonly updated_at: Date;
    get roi(): number;
    get conversion_rate(): number;
}
export default Campaign;
//# sourceMappingURL=Campaign.d.ts.map