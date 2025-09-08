import mysql from "mysql2/promise";

async function fixTeacherStatus() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password",
      database: "vertex_school_erp",
    });

    console.log("Setting John Smith back to pending status...");

    // Set John Smith back to pending
    await connection.execute(`
      UPDATE users 
      SET approval_status = 'pending' 
      WHERE email = 'john.smith@teacher.com'
    `);

    console.log("✓ John Smith set back to pending approval status");

    // Verify the change
    const [result] = await connection.execute(`
      SELECT name, email, approval_status 
      FROM users 
      WHERE email = 'john.smith@teacher.com'
    `);

    console.log("Current status:", result[0]);

    await connection.end();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

fixTeacherStatus();
