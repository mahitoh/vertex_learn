#!/usr/bin/env node

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugDatabase() {
  console.log("🔍 Debugging database roles and users...");

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

    // Check roles table
    console.log("\n📋 ROLES TABLE:");
    const [roles] = await connection.query("SELECT * FROM roles ORDER BY id");
    console.table(roles);

    // Check users table (first 5 users)
    console.log("\n👥 USERS TABLE (with role info):");
    const [users] = await connection.query(`
      SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, r.description as role_description
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      ORDER BY u.id 
      LIMIT 5
    `);
    console.table(users);

    // Check specific super admin user
    console.log("\n🔧 SUPER ADMIN USER:");
    const [superAdmin] = await connection.query(`
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = 'superadmin@vertexlearn.com'
    `);
    console.table(superAdmin);

    await connection.end();
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    process.exit(1);
  }
}

// Run the debug
debugDatabase();
