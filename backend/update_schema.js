import mysql from "mysql2/promise";

(async () => {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "vertex_school_erp",
  });

  await conn.execute(
    `ALTER TABLE organizations MODIFY COLUMN status ENUM('pending', 'approved', 'suspended', 'rejected') DEFAULT 'pending'`
  );
  console.log("Updated status enum to include rejected");

  const [columns] = await conn.execute("DESCRIBE organizations");
  console.log("Updated organizations table structure:");
  columns.forEach((col) =>
    console.log(
      "Column:",
      col.Field,
      "Type:",
      col.Type,
      "Default:",
      col.Default
    )
  );

  await conn.end();
})();
