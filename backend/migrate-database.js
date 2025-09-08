#!/usr/bin/env node

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateDatabase() {
  console.log("🔄 Running database migration for new role structure...");

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

    console.log("🔍 Checking if migration is needed...");

    // Check if organization_id column exists
    const [columns] = await connection.query(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'organization_id'
    `,
      [database]
    );

    if (columns.length === 0) {
      console.log("➕ Adding organization_id column to users table...");
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN organization_id INT NULL AFTER role_id,
        ADD FOREIGN KEY (organization_id) REFERENCES organizations(id)
      `);
      console.log("✅ organization_id column added successfully");
    } else {
      console.log("✅ organization_id column already exists");
    }

    // Check if organizations table exists
    const [orgTable] = await connection.query(
      `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'organizations'
    `,
      [database]
    );

    if (orgTable.length === 0) {
      console.log("📊 Creating organizations table...");
      await connection.query(`
        CREATE TABLE organizations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          address TEXT,
          phone VARCHAR(20),
          email VARCHAR(255),
          website VARCHAR(255),
          status ENUM('pending', 'approved', 'suspended', 'cancelled') DEFAULT 'pending',
          approved_by INT NULL,
          approved_at TIMESTAMP NULL,
          subscription_plan ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
          subscription_expires_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (approved_by) REFERENCES users(id)
        )
      `);
      console.log("✅ Organizations table created");
    } else {
      console.log("✅ Organizations table already exists");
    }

    // Update roles if needed
    console.log("🔄 Updating roles...");

    // Disable foreign key checks temporarily
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    // First, delete all users to avoid foreign key constraints
    await connection.query("DELETE FROM users");
    console.log("🗑️ Cleared existing users");

    // Then delete and recreate roles
    await connection.query("DELETE FROM roles");
    await connection.query(`
      INSERT INTO roles (name, description) VALUES
      ('super_admin', 'Super Administrator with system-wide access across all organizations'),
      ('org_admin', 'Organization Administrator with full access within their organization'),
      ('finance_manager', 'Finance Manager with financial and marketing management access'),
      ('teacher', 'Teacher with course management access'),
      ('student', 'Student with limited access')
    `);
    console.log("✅ Roles updated successfully");

    // Insert test organizations
    console.log("🏢 Inserting test organizations...");
    await connection.query("DELETE FROM organizations");
    await connection.query(`
      INSERT INTO organizations (name, code, description, address, phone, email, website, status, subscription_plan) VALUES
      ('Vertex University', 'VU001', 'Main university campus for testing', '123 Education Street, Learning City', '+1-555-0123', 'info@vertexuni.edu', 'https://vertexuni.edu', 'approved', 'enterprise'),
      ('Tech Academy', 'TA002', 'Technology focused academy', '456 Tech Boulevard, Innovation District', '+1-555-0456', 'contact@techacademy.edu', 'https://techacademy.edu', 'approved', 'premium'),
      ('Community College', 'CC003', 'Local community college', '789 Community Lane, Downtown', '+1-555-0789', 'admin@communitycollege.edu', 'https://communitycollege.edu', 'pending', 'basic')
    `);
    console.log("✅ Test organizations inserted");

    // Clear existing users and insert test users
    console.log("👥 Inserting test users...");
    await connection.query(`
      INSERT INTO users (name, email, password, role_id, organization_id, department, employee_id, phone, validation_status) VALUES
      -- Super Admin (system-wide access, no organization)
      ('Super Administrator', 'superadmin@vertexlearn.com', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 1, NULL, 'System Administration', 'SUPER001', '+1-555-1001', 'approved'),
      
      -- Organization Admins
      ('John Smith', 'admin@vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 1, 'Administration', 'VU_ADMIN001', '+1-555-1002', 'approved'),
      ('Sarah Johnson', 'admin@techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 2, 'Administration', 'TA_ADMIN001', '+1-555-1003', 'approved'),
      ('Michael Brown', 'admin@communitycollege.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 3, 'Administration', 'CC_ADMIN001', '+1-555-1004', 'approved'),
      
      -- Finance Managers
      ('Emma Wilson', 'finance@vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 3, 1, 'Finance', 'VU_FIN001', '+1-555-1005', 'approved'),
      ('David Lee', 'finance@techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 3, 2, 'Finance', 'TA_FIN001', '+1-555-1006', 'approved'),
      
      -- Teachers
      ('Dr. Alice Cooper', 'alice.cooper@vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 1, 'Computer Science', 'VU_TEACH001', '+1-555-1007', 'approved'),
      ('Prof. Robert Davis', 'robert.davis@vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 1, 'Mathematics', 'VU_TEACH002', '+1-555-1008', 'approved'),
      ('Ms. Lisa Chen', 'lisa.chen@techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 2, 'Web Development', 'TA_TEACH001', '+1-555-1009', 'approved'),
      
      -- Students
      ('James Rodriguez', 'james.rodriguez@student.vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 5, 1, 'Computer Science', 'VU_STU001', '+1-555-1010', 'approved'),
      ('Maria Garcia', 'maria.garcia@student.vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 5, 1, 'Mathematics', 'VU_STU002', '+1-555-1011', 'approved'),
      ('Kevin Park', 'kevin.park@student.techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 5, 2, 'Web Development', 'TA_STU001', '+1-555-1012', 'approved'),
      ('Sophie Turner', 'sophie.turner@student.communitycollege.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 5, 3, 'General Studies', 'CC_STU001', '+1-555-1013', 'approved')
    `);
    console.log("✅ Test users inserted");

    // Re-enable foreign key checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    await connection.end();

    console.log("🎉 Database migration completed successfully!");
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
    console.log(
      "🚀 Database is ready! You can now start the server with: npm run dev"
    );
  } catch (error) {
    console.error("❌ Database migration failed:", error.message);
    console.error("");
    console.error("Please make sure:");
    console.error("1. MySQL server is running");
    console.error("2. The credentials in .env file are correct");
    console.error("3. The database exists");
    process.exit(1);
  }
}

// Run the migration
migrateDatabase();
