"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Campaign extends sequelize_1.Model {
    get roi() {
        if (this.spent === 0)
            return 0;
        const revenue = this.conversions * 1000;
        return ((revenue - this.spent) / this.spent) * 100;
    }
    get conversion_rate() {
        if (this.leads === 0)
            return 0;
        return (this.conversions / this.leads) * 100;
    }
}
exports.Campaign = Campaign;
Campaign.init({
    campaign_id: {
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
    campaign_type: {
        type: sequelize_1.DataTypes.ENUM('digital', 'print', 'social_media', 'email', 'event', 'other'),
        allowNull: false,
    },
    budget: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    spent: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    leads: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    conversions: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    start_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    end_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('planning', 'active', 'paused', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'planning',
    },
    target_audience: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
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
});
exports.default = Campaign;
//# sourceMappingURL=Campaign.js.map