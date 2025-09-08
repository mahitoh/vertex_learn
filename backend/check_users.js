import mysql from "mysql2/promise";

(async () => {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "vertex_school_erp",
  });

  console.log("=== ALL ADMIN USERS (Role ID 2) ===");
  const [admins] = await conn.execute(`
    SELECT u.id, u.name, u.email, u.password, u.role_id, u.organization_id, o.name as org_name 
    FROM users u 
    LEFT JOIN organizations o ON u.organization_id = o.id 
    WHERE u.role_id = 2 
    ORDER BY u.created_at DESC
  `);

  admins.forEach((admin) => {
    console.log(`ID: ${admin.id}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(
      `Organization: ${admin.org_name} (ID: ${admin.organization_id})`
    );
    console.log(`Password Hash: ${admin.password.substring(0, 20)}...`);
    console.log("---");
  });

  console.log("\n=== SUPER ADMIN (Role ID 1) ===");
  const [superAdmins] = await conn.execute(`
    SELECT u.id, u.name, u.email, u.password, u.role_id 
    FROM users u 
    WHERE u.role_id = 1 
    ORDER BY u.created_at DESC
  `);

  superAdmins.forEach((admin) => {
    console.log(`ID: ${admin.id}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password Hash: ${admin.password.substring(0, 20)}...`);
    console.log("---");
  });

  await conn.end();
})();
