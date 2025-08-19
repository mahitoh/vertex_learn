"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Asset extends sequelize_1.Model {
    get depreciation() {
        if (!this.purchase_price || !this.current_value)
            return 0;
        return this.purchase_price - this.current_value;
    }
    get is_under_warranty() {
        if (!this.warranty_expiry)
            return false;
        return new Date() < new Date(this.warranty_expiry);
    }
}
exports.Asset = Asset;
Asset.init({
    asset_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    asset_type: {
        type: sequelize_1.DataTypes.ENUM('computer', 'furniture', 'equipment', 'vehicle', 'software', 'other'),
        allowNull: false,
    },
    asset_tag: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    serial_number: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    purchase_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    purchase_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0,
        },
    },
    current_value: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0,
        },
    },
    assigned_to: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'employees',
            key: 'employee_id',
        },
    },
    location: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('available', 'assigned', 'maintenance', 'retired', 'lost'),
        allowNull: false,
        defaultValue: 'available',
    },
    warranty_expiry: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
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
});
exports.default = Asset;
//# sourceMappingURL=Asset.js.map