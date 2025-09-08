import pkg from "pg";
const { Client } = pkg;

async function checkRoles() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:password@localhost:5432/vertex_learn",
  });

  try {
    await client.connect();

    console.log("Available roles in database:");
    const rolesResult = await client.query("SELECT DISTINCT name FROM roles");
    rolesResult.rows.forEach((row) => console.log(" -", row.name));

    console.log("\nAdmin users and their roles:");
    const adminUsersResult = await client.query(`
      SELECT u.email, r.name as role 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name LIKE '%admin%'
    `);
    adminUsersResult.rows.forEach((row) =>
      console.log(` - ${row.email}: ${row.role}`)
    );
  } finally {
    await client.end();
  }
}

checkRoles().catch(console.error);
