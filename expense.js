module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define("Expense", {
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });

  return Expense;
};
