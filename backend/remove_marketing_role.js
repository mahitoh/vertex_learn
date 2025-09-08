import mysql from "mysql2/promise";

async function removeMarketingRole() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "vertex_school_erp",
  });

  try {
    // Remove marketing role (but keep finance_manager as it's a separate department)
    await connection.execute("DELETE FROM roles WHERE name = ?", ["marketing"]);
    console.log("✓ Removed marketing role");

    // Show remaining roles
    const [roles] = await connection.execute(
      "SELECT id, name, description FROM roles ORDER BY id"
    );
    console.log("\nRemaining roles:");
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

removeMarketingRole().catch(console.error);
