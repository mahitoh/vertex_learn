import mysql from "mysql2/promise";

(async () => {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "vertex_school_erp",
  });

  console.log("=== APPROVED ORGANIZATIONS ===");
  const [orgs] = await conn.execute(
    'SELECT id, name, status FROM organizations WHERE status = "approved" ORDER BY created_at DESC'
  );
  orgs.forEach((org) =>
    console.log(`ID: ${org.id}, Name: ${org.name}, Status: ${org.status}`)
  );

  console.log("\n=== ORGANIZATION ADMINS (Role ID 2) ===");
  const [users] = await conn.execute(
    "SELECT id, name, email, role_id, organization_id FROM users WHERE role_id = 2 ORDER BY created_at DESC"
  );
  users.forEach((user) =>
    console.log(
      `ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Org ID: ${user.organization_id}`
    )
  );

  console.log("\n=== ALL ROLES ===");
  const [roles] = await conn.execute("SELECT id, name FROM roles ORDER BY id");
  roles.forEach((role) => console.log(`ID: ${role.id}, Name: ${role.name}`));

  await conn.end();
})();
