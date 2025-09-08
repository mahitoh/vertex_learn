import mysql from "mysql2/promise";

(async () => {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "vertex_school_erp",
  });

  const [orgs] = await conn.execute(
    'SELECT id, name, status FROM organizations WHERE status = "pending"'
  );
  console.log("Pending organizations:");
  orgs.forEach((org) =>
    console.log("ID:", org.id, "Name:", org.name, "Status:", org.status)
  );

  await conn.end();
})();
