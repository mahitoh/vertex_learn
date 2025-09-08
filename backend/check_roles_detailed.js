import mysql from "mysql2/promise";

async function checkRoles() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "vertex_school_erp",
  });

  const [roles] = await connection.execute(
    "SELECT id, name, description FROM roles"
  );
  console.log("Available roles:");
  roles.forEach((role) => {
    console.log(
      `- ID: ${role.id}, Name: ${role.name}, Description: ${
        role.description || "No description"
      }`
    );
  });

  await connection.end();
}

checkRoles().catch(console.error);
