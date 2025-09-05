const { Sequelize, DataTypes } = require("sequelize");

// ⚠️ Mets à jour avec tes infos de connexion PostgreSQL
const sequelize = new Sequelize("finance_db", "postgres", "jojoinator", {
  host: "localhost",
  dialect: "postgres", // ✅ PostgreSQL
  logging: false, // désactive les logs SQL (optionnel)
});

// Vérifier connexion
sequelize.authenticate()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch(err => console.error("❌ Erreur connexion PostgreSQL:", err));

// Import des modèles
const Student = require("./student")(sequelize, DataTypes);
const Invoice = require("./invoice")(sequelize, DataTypes);
const Expense = require("./expense")(sequelize, DataTypes);
const Campaign = require("./campaign")(sequelize, DataTypes);

// Définir les relations
Student.hasMany(Invoice, { foreignKey: "studentId", onDelete: "SET NULL" });
Invoice.belongsTo(Student, { foreignKey: "studentId", onDelete: "SET NULL" });

const db = {
  sequelize,
  Sequelize,
  Student,
  Invoice,
  Expense,
  Campaign,
};

module.exports = db;
