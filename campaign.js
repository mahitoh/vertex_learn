module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define("Campaign", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    leads: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    conversions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    roi: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
  });

  return Campaign;
};
