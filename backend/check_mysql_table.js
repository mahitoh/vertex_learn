import mysql from "mysql2/promise";

async function checkTable() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password",
      database: "vertex_school_erp",
    });

    console.log("Connected to vertex_school_erp database");

    // Show tables
    const [tables] = await connection.execute("SHOW TABLES");
    console.log("\nAvailable tables:");
    tables.forEach((table) => console.log(`- ${Object.values(table)[0]}`));

    // Check users table structure
    const [columns] = await connection.execute("SHOW COLUMNS FROM users");
    console.log("\nUsers table columns:");
    columns.forEach((col) => {
      console.log(
        `- ${col.Field}: ${col.Type} ${
          col.Null === "YES" ? "(nullable)" : "(required)"
        }`
      );
    });

    await connection.end();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkTable();
