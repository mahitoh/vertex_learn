import mysql from "mysql2/promise";

(async () => {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "vertex_school_erp",
  });

  const [users] = await conn.execute(
    'SELECT id, name, email, organization_id FROM users WHERE email LIKE "%communitycollege%" OR email LIKE "%admin%"'
  );
  console.log("Users with admin or community college emails:");
  users.forEach((user) =>
    console.log(
      "ID:",
      user.id,
      "Name:",
      user.name,
      "Email:",
      user.email,
      "Org ID:",
      user.organization_id
    )
  );

  const [orgs] = await conn.execute(
    'SELECT id, name, email, status FROM organizations WHERE name LIKE "%Community%" OR email LIKE "%communitycollege%"'
  );
  console.log("\nOrganizations with Community College:");
  orgs.forEach((org) =>
    console.log(
      "ID:",
      org.id,
      "Name:",
      org.name,
      "Email:",
      org.email,
      "Status:",
      org.status
    )
  );

  await conn.end();
})();
