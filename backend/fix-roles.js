#!/usr/bin/env node

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixRoleReferences() {
  console.log("🔧 Fixing user role references...");

  try {
    // Parse DATABASE_URL from .env
    const envPath = path.join(__dirname, ".env");
    const envContent = fs.readFileSync(envPath, "utf8");
    const dbUrlMatch = envContent.match(
      /DATABASE_URL="mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^"]+)"/
    );

    if (!dbUrlMatch) {
      throw new Error("Invalid DATABASE_URL format in .env file");
    }

    const [, user, password, host, port, database] = dbUrlMatch;

    console.log(`📊 Connecting to MySQL at ${host}:${port}...`);

    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
    });

    // Get current role IDs
    const [roles] = await connection.query(
      "SELECT id, name FROM roles ORDER BY id"
    );
    console.log("📋 Current roles:");
    console.table(roles);

    // Create a mapping from role names to IDs
    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    console.log("🔄 Role mapping:", roleMap);

    // Update users with correct role IDs
    console.log("👥 Updating user role references...");

    // Super Admin
    await connection.query("UPDATE users SET role_id = ? WHERE email = ?", [
      roleMap["super_admin"],
      "superadmin@vertexlearn.com",
    ]);
    console.log("✅ Updated Super Admin");

    // Org Admins
    await connection.query(
      "UPDATE users SET role_id = ? WHERE email IN (?, ?, ?)",
      [
        roleMap["org_admin"],
        "admin@vertexuni.edu",
        "admin@techacademy.edu",
        "admin@communitycollege.edu",
      ]
    );
    console.log("✅ Updated Org Admins");

    // Finance Managers
    await connection.query(
      "UPDATE users SET role_id = ? WHERE email IN (?, ?)",
      [
        roleMap["finance_manager"],
        "finance@vertexuni.edu",
        "finance@techacademy.edu",
      ]
    );
    console.log("✅ Updated Finance Managers");

    // Teachers
    await connection.query(
      "UPDATE users SET role_id = ? WHERE email IN (?, ?, ?)",
      [
        roleMap["teacher"],
        "alice.cooper@vertexuni.edu",
        "robert.davis@vertexuni.edu",
        "lisa.chen@techacademy.edu",
      ]
    );
    console.log("✅ Updated Teachers");

    // Students
    await connection.query(
      "UPDATE users SET role_id = ? WHERE email IN (?, ?, ?, ?)",
      [
        roleMap["student"],
        "james.rodriguez@student.vertexuni.edu",
        "maria.garcia@student.vertexuni.edu",
        "kevin.park@student.techacademy.edu",
        "sophie.turner@student.communitycollege.edu",
      ]
    );
    console.log("✅ Updated Students");

    // Verify the fix
    console.log("\n🔍 Verification - Super Admin user:");
    const [superAdmin] = await connection.query(`
      SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, r.description as role_description
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = 'superadmin@vertexlearn.com'
    `);
    console.table(superAdmin);

    await connection.end();

    console.log("🎉 Role references fixed successfully!");
    console.log(
      "✅ You can now login with: superadmin@vertexlearn.com / admin123"
    );
  } catch (error) {
    console.error("❌ Fix failed:", error.message);
    process.exit(1);
  }
}

// Run the fix
fixRoleReferences();
