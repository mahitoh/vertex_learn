import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

// Database connection
const getConnection = async () => {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "vertex_school_erp",
  });
};

// Get all schools/organizations (for dropdowns)
router.get("/organizations", async (req, res) => {
  try {
    const connection = await getConnection();

    const [rows] = await connection.execute(
      "SELECT id, name, address, phone, email FROM organizations ORDER BY name ASC"
    );

    await connection.end();

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new school (Super Admin only)
router.post("/create-school", authenticateJWT, async (req, res) => {
  try {
    const { schoolName, address, phone, email } = req.body;
    const connection = await getConnection();

    // Check if user is super admin
    const [userRows] = await connection.execute(
      "SELECT role_id FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!userRows.length || userRows[0].role_id !== 1) {
      return res
        .status(403)
        .json({ message: "Only super admins can create schools" });
    }

    // Check if school already exists
    const [existingSchool] = await connection.execute(
      "SELECT id FROM organizations WHERE name = ? OR email = ?",
      [schoolName, email]
    );

    if (existingSchool.length > 0) {
      return res
        .status(400)
        .json({ message: "School with this name or email already exists" });
    }

    // Generate a unique school code
    const schoolCode =
      schoolName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 10) + Date.now().toString().slice(-3);

    // Create new organization/school
    const [result] = await connection.execute(
      "INSERT INTO organizations (name, code, address, phone, email, status) VALUES (?, ?, ?, ?, ?, 'pending')",
      [schoolName, schoolCode, address, phone, email]
    );

    await connection.end();

    res.json({
      success: true,
      message: "School created successfully",
      schoolId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating school:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create school admin (Super Admin only)
router.post("/create-admin", authenticateJWT, async (req, res) => {
  try {
    const { schoolId, adminName, adminEmail, adminPassword } = req.body;
    const connection = await getConnection();

    // Check if user is super admin
    const [userRows] = await connection.execute(
      "SELECT role_id FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!userRows.length || userRows[0].role_id !== 1) {
      return res
        .status(403)
        .json({ message: "Only super admins can create school admins" });
    }

    // Check if school exists
    const [schoolRows] = await connection.execute(
      "SELECT id, name FROM organizations WHERE id = ?",
      [schoolId]
    );

    if (!schoolRows.length) {
      return res.status(404).json({ message: "School not found" });
    }

    // Check if admin email already exists
    const [existingUser] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [adminEmail]
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user (role_id = 2 for admin)
    const [result] = await connection.execute(
      `INSERT INTO users (name, email, password, role_id, organization_id, approval_status, is_active, created_at) 
       VALUES (?, ?, ?, 2, ?, 'approved', true, NOW())`,
      [adminName, adminEmail, hashedPassword, schoolId]
    );

    await connection.end();

    res.json({
      success: true,
      message: `Admin created successfully for ${schoolRows[0].name}`,
      adminId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating school admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all schools with admin status (Super Admin only)
router.get("/manage-schools", authenticateJWT, async (req, res) => {
  try {
    const connection = await getConnection();

    // Check if user is super admin
    const [userRows] = await connection.execute(
      "SELECT role_id FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!userRows.length || userRows[0].role_id !== 1) {
      return res
        .status(403)
        .json({ message: "Only super admins can manage schools" });
    }

    // Get schools with admin info
    const [rows] = await connection.execute(`
      SELECT 
        o.id as school_id,
        o.name as school_name,
        o.address,
        o.phone,
        o.email,
        u.id as admin_id,
        u.name as admin_name,
        u.email as admin_email,
        u.is_active as admin_active,
        (SELECT COUNT(*) FROM users WHERE organization_id = o.id AND role_id = 3) as teacher_count,
        (SELECT COUNT(*) FROM users WHERE organization_id = o.id AND role_id = 4) as student_count
      FROM organizations o
      LEFT JOIN users u ON o.id = u.organization_id AND u.role_id = 2 AND u.is_active = true
      ORDER BY o.name ASC
    `);

    await connection.end();

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
