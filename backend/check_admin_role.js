import mysql from "mysql2/promise";

async function checkAdminRole() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "vertex_school_erp",
  });

  try {
    const [users] = await connection.execute(`
      SELECT u.email, r.name as role 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.email LIKE '%admin%'
    `);

    console.log("Admin users and their roles:");
    users.forEach((user) => {
      console.log(`- ${user.email}: ${user.role}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

checkAdminRole().catch(console.error);
