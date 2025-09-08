import { query } from "./src/config/database.js";

async function checkTableStructure() {
  try {
    console.log("Checking users table structure...");
    const result = await query("DESCRIBE users");
    console.log("Users table columns:");
    result.rows.forEach((row) => {
      console.log(
        `- ${row.Field}: ${row.Type} ${
          row.Null === "YES" ? "(nullable)" : "(required)"
        }`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

checkTableStructure();
