import { Model, Optional } from 'sequelize';
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
export interface AssetCreationAttributes extends Optional<AssetAttributes, 'asset_id' | 'status' | 'created_at' | 'updated_at'> {
}
export declare class Asset extends Model<AssetAttributes, AssetCreationAttributes> implements AssetAttributes {
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
    readonly created_at: Date;
    readonly updated_at: Date;
    get depreciation(): number;
    get is_under_warranty(): boolean;
}
export default Asset;
//# sourceMappingURL=Asset.d.ts.map