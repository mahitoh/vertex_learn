import mysql from "mysql2/promise";
import fs from "fs";

async function setupSimpleDatabase() {
  // First connection to create database
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
  });

  try {
    console.log("🗑️ Dropping existing database...");
    await connection.execute("DROP DATABASE IF EXISTS vertex_school_erp");

    console.log("📦 Creating database...");
    await connection.execute("CREATE DATABASE vertex_school_erp");

    await connection.end();

    // Second connection to the new database
    const dbConnection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password",
      database: "vertex_school_erp",
      multipleStatements: true,
    });

    console.log("📋 Creating tables and inserting data...");

    // Create tables
    await dbConnection.execute(`
      CREATE TABLE organizations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        status ENUM('pending', 'approved', 'suspended') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await dbConnection.execute(`
      CREATE TABLE roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbConnection.execute(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id INT NOT NULL,
        organization_id INT NULL,
        phone VARCHAR(20),
        employee_id VARCHAR(50),
        student_id VARCHAR(50),
        is_active BOOLEAN DEFAULT FALSE,
        approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by INT NULL,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id),
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      )
    `);

    // Insert roles
    await dbConnection.execute(`
      INSERT INTO roles (id, name, description) VALUES
      (1, 'super_admin', 'Super Administrator - manages all schools'),
      (2, 'admin', 'School Administrator - manages one school'),
      (3, 'teacher', 'Teacher - teaches courses'),
      (4, 'student', 'Student - takes courses')
    `);

    // Insert organizations
    await dbConnection.execute(`
      INSERT INTO organizations (name, code, description, address, phone, email, status) VALUES
      ('Vertex High School', 'VHS001', 'Main high school', '123 School Street', '+1-555-0123', 'info@vertexhs.edu', 'approved'),
      ('Tech Academy', 'TA002', 'Technology academy', '456 Tech Blvd', '+1-555-0456', 'admin@techacademy.edu', 'approved'),
      ('Community College', 'CC003', 'Community college', '789 Community Lane', '+1-555-0789', 'admin@communitycollege.edu', 'pending')
    `);

    // Insert users with proper approval status
    await dbConnection.execute(`
      INSERT INTO users (name, email, password, role_id, organization_id, employee_id, student_id, is_active, approval_status, approved_by, approved_at) VALUES
      ('Super Admin', 'superadmin@vertexlearn.com', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 1, NULL, 'SUPER001', NULL, TRUE, 'approved', NULL, NOW()),
      ('John Smith', 'admin@vertexhs.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 1, 'VHS_ADMIN', NULL, TRUE, 'approved', 1, NOW()),
      ('Sarah Johnson', 'admin@techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 2, 'TA_ADMIN', NULL, TRUE, 'approved', 1, NOW()),
      ('Mike Wilson', 'admin@communitycollege.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 3, 'CC_ADMIN', NULL, TRUE, 'approved', 1, NOW())
    `);

    // Insert teachers (pending approval by their school admin)
    await dbConnection.execute(`
      INSERT INTO users (name, email, password, role_id, organization_id, employee_id, student_id, is_active, approval_status) VALUES
      ('Dr. Alice Cooper', 'alice.cooper@vertexhs.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 3, 1, 'VHS_TEACH001', NULL, FALSE, 'pending'),
      ('Prof. Robert Davis', 'robert.davis@vertexhs.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 3, 1, 'VHS_TEACH002', NULL, FALSE, 'pending'),
      ('Ms. Lisa Chen', 'lisa.chen@techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 3, 2, 'TA_TEACH001', NULL, FALSE, 'pending')
    `);

    // Insert students (pending approval by their school admin)
    await dbConnection.execute(`
      INSERT INTO users (name, email, password, role_id, organization_id, employee_id, student_id, is_active, approval_status) VALUES
      ('James Rodriguez', 'james@student.vertexhs.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 1, NULL, 'VHS_STU001', FALSE, 'pending'),
      ('Maria Garcia', 'maria@student.vertexhs.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 1, NULL, 'VHS_STU002', FALSE, 'pending'),
      ('Kevin Park', 'kevin@student.techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 2, NULL, 'TA_STU001', FALSE, 'pending'),
      ('Sophie Turner', 'sophie@student.communitycollege.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 3, NULL, 'CC_STU001', FALSE, 'pending')
    `);
    await dbConnection.end();

    console.log("✅ Approval-based ERP system setup complete!");
    console.log("\n📋 Test Credentials (Password: admin123):");
    console.log(
      "🔹 Super Admin: superadmin@vertexlearn.com (Manages all schools)"
    );
    console.log(
      "🔹 School Admin: admin@vertexhs.edu (Approves teachers/students)"
    );
    console.log(
      "🔹 Teacher (PENDING): alice.cooper@vertexhs.edu (Needs admin approval)"
    );
    console.log(
      "🔹 Student (PENDING): james@student.vertexhs.edu (Needs admin approval)"
    );
    console.log("\n🎯 ERP Flow:");
    console.log("1. Super Admin registers schools");
    console.log("2. School admins get created with school emails");
    console.log("3. Teachers/Students register → Admin approves → Get access");
    console.log("4. Finance/Marketing modules separate per school");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
  }
}

setupSimpleDatabase();
