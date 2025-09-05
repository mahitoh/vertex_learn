module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define("Invoice", {
    amount: { type: DataTypes.FLOAT, allowNull: false },
    dueDate: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "unpaid" },
    paymentMethod: { type: DataTypes.STRING }
  });
  Invoice.associate = (models) => {
    Invoice.belongsTo(models.Student, { foreignKey: "studentId" });
  };
  return Invoice;
};