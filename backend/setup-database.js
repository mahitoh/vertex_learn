#!/usr/bin/env node

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log("🚀 Setting up MySQL database for Vertex Learn ERP...");

  try {
    // Read the database schema
    const schemaPath = path.join(__dirname, "database-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

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

    // Create connection without database first
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
    });

    // Create database if it doesn't exist
    console.log(`🗄️ Creating database '${database}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);

    // Use the database
    await connection.query(`USE \`${database}\``);

    // Split schema into individual statements
    // Remove comments and split by semicolon
    const cleanSchema = schema
      .split("\n")
      .filter((line) => !line.trim().startsWith("--") && line.trim().length > 0)
      .join("\n");

    const statements = cleanSchema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements...`);
    console.log(
      "First few statements:",
      statements.slice(0, 3).map((s) => s.substring(0, 50) + "...")
    );

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.query(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          if (
            error.code === "ER_TABLE_EXISTS_ERROR" ||
            error.code === "ER_DUP_ENTRY"
          ) {
            console.log(
              `⚠️ Skipped statement ${i + 1}/${
                statements.length
              } (already exists)`
            );
          } else {
            console.error(
              `❌ Error in statement ${i + 1}/${statements.length}:`,
              error.message
            );
          }
        }
      }
    }

    await connection.end();

    console.log("🎉 Database setup completed successfully!");
    console.log("");
    console.log("📋 TEST CREDENTIALS (Password for all: admin123):");
    console.log("");
    console.log("🔧 SUPER ADMIN (System-wide access):");
    console.log("   Email: superadmin@vertexlearn.com");
    console.log("   Access: All organizations, system management");
    console.log("");
    console.log("👔 ORGANIZATION ADMINS:");
    console.log("   • Vertex University: admin@vertexuni.edu");
    console.log("   • Tech Academy: admin@techacademy.edu");
    console.log("   • Community College: admin@communitycollege.edu");
    console.log("");
    console.log("💰 FINANCE MANAGERS:");
    console.log("   • Vertex University: finance@vertexuni.edu");
    console.log("   • Tech Academy: finance@techacademy.edu");
    console.log("");
    console.log("🎓 TEACHERS:");
    console.log("   • Dr. Alice Cooper (CS): alice.cooper@vertexuni.edu");
    console.log("   • Prof. Robert Davis (Math): robert.davis@vertexuni.edu");
    console.log("   • Ms. Lisa Chen (Web Dev): lisa.chen@techacademy.edu");
    console.log("");
    console.log("👨‍🎓 STUDENTS:");
    console.log("   • James Rodriguez: james.rodriguez@student.vertexuni.edu");
    console.log("   • Maria Garcia: maria.garcia@student.vertexuni.edu");
    console.log("   • Kevin Park: kevin.park@student.techacademy.edu");
    console.log(
      "   • Sophie Turner: sophie.turner@student.communitycollege.edu"
    );
    console.log("");
    console.log("📊 DASHBOARD ROUTES:");
    console.log("   • Super Admin: /super-admin");
    console.log("   • Finance Manager: /finance");
    console.log("   • Org Admin: /admin");
    console.log("   • Teacher: /teacher");
    console.log("   • Student: /student");
    console.log("");
    console.log("📄 See TEST_CREDENTIALS.md for complete testing guide");
    console.log("🚀 You can now start the server with: npm run dev");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    console.error("");
    console.error("Please make sure:");
    console.error("1. MySQL server is running");
    console.error("2. The credentials in .env file are correct");
    console.error("3. The user has permission to create databases");
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
