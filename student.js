module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define("Student", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  // Associations
  Student.associate = (models) => {
    Student.hasMany(models.Invoice, { foreignKey: "studentId" });
  };

  return Student;
};
