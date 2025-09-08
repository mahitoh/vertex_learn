import mysql from "mysql2/promise";

async function addMissingRoles() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "vertex_school_erp",
  });

  try {
    // Add finance_manager role
    await connection.execute(`
      INSERT INTO roles (name, description) 
      VALUES ('finance_manager', 'Finance Manager - handles financial operations')
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `);
    console.log("✓ Added finance_manager role");

    // Add marketing role
    await connection.execute(`
      INSERT INTO roles (name, description) 
      VALUES ('marketing', 'Marketing Staff - handles marketing and promotions')
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `);
    console.log("✓ Added marketing role");

    // Show all roles
    const [roles] = await connection.execute(
      "SELECT id, name, description FROM roles ORDER BY id"
    );
    console.log("\nAll available roles:");
    roles.forEach((role) => {
      console.log(
        `- ID: ${role.id}, Name: ${role.name}, Description: ${role.description}`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

addMissingRoles().catch(console.error);
