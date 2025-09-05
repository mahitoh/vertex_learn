const express = require("express");
const app = express();
const cors = require("cors");
const { sequelize } = require("./models"); // Import Sequelize (index.js)

// Middleware
app.use(cors());
app.use(express.json());

// Import des routes
const financeRoutes = require("./finance");
app.use("/api/finance", financeRoutes);

// Test de la connexion à la DB et synchronisation
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection to the database has been established successfully.");
    
    // Crée les tables si elles n'existent pas
    await sequelize.sync({ alter: true }); // alter:true pour mettre à jour la structure si besoin
    console.log("✅ Database synchronized");

    const PORT = 5000;
    app.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
}

// Lancer le serveur
startServer();
