import express from "express";
import mysql from "mysql2/promise";
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

// Get pending users for approval (admin only)
router.get("/pending-users", authenticateJWT, async (req, res) => {
  try {
    const connection = await getConnection();

    // Get current user to check permissions
    const [userRows] = await connection.execute(
      "SELECT role_id, organization_id FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!userRows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = userRows[0];

    // Only admins (role_id = 2) and super_admins (role_id = 1) can see pending users
    if (![1, 2].includes(currentUser.role_id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    let query;
    let params;

    if (currentUser.role_id === 1) {
      // Super admin can see all pending users
      query = `
        SELECT u.*, r.name as role_name, o.name as organization_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        LEFT JOIN organizations o ON u.organization_id = o.id 
        WHERE u.approval_status = 'pending' 
        ORDER BY u.created_at DESC
      `;
      params = [];
    } else {
      // School admin can only see pending users from their organization
      query = `
        SELECT u.*, r.name as role_name, o.name as organization_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        LEFT JOIN organizations o ON u.organization_id = o.id 
        WHERE u.approval_status = 'pending' AND u.organization_id = ?
        ORDER BY u.created_at DESC
      `;
      params = [currentUser.organization_id];
    }

    const [rows] = await connection.execute(query, params);

    await connection.end();

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Approve user
router.post("/approve-user/:userId", authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await getConnection();

    // Get current user to check permissions
    const [userRows] = await connection.execute(
      "SELECT role_id, organization_id FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!userRows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = userRows[0];

    // Only admins and super_admins can approve users
    if (![1, 2].includes(currentUser.role_id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get the user to be approved
    const [targetUserRows] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (!targetUserRows.length) {
      await connection.end();
      return res.status(404).json({ message: "User to approve not found" });
    }

    const targetUser = targetUserRows[0];

    // School admin can only approve users from their organization
    if (
      currentUser.role_id === 2 &&
      targetUser.organization_id !== currentUser.organization_id
    ) {
      await connection.end();
      return res
        .status(403)
        .json({ message: "Can only approve users from your organization" });
    }

    // Update user approval status
    await connection.execute(
      "UPDATE users SET approval_status = ?, is_active = ?, approved_by = ?, approved_at = NOW() WHERE id = ?",
      ["approved", true, req.user.id, userId]
    );

    await connection.end();

    res.json({
      success: true,
      message: "User approved successfully",
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reject user
router.post("/reject-user/:userId", authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const connection = await getConnection();

    // Get current user to check permissions
    const [userRows] = await connection.execute(
      "SELECT role_id, organization_id FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!userRows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = userRows[0];

    // Only admins and super_admins can reject users
    if (![1, 2].includes(currentUser.role_id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get the user to be rejected
    const [targetUserRows] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (!targetUserRows.length) {
      await connection.end();
      return res.status(404).json({ message: "User to reject not found" });
    }

    const targetUser = targetUserRows[0];

    // School admin can only reject users from their organization
    if (
      currentUser.role_id === 2 &&
      targetUser.organization_id !== currentUser.organization_id
    ) {
      await connection.end();
      return res
        .status(403)
        .json({ message: "Can only reject users from your organization" });
    }

    // Update user approval status
    await connection.execute(
      "UPDATE users SET approval_status = ?, is_active = ?, approved_by = ?, approved_at = NOW() WHERE id = ?",
      ["rejected", false, req.user.id, userId]
    );

    await connection.end();

    res.json({
      success: true,
      message: "User rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get approval statistics
router.get("/approval-stats", authenticateJWT, async (req, res) => {
  try {
    const connection = await getConnection();

    // Get current user to check permissions
    const [userRows] = await connection.execute(
      "SELECT role_id, organization_id FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!userRows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = userRows[0];

    // Only admins and super_admins can see stats
    if (![1, 2].includes(currentUser.role_id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    let whereClause = "";
    let params = [];

    if (currentUser.role_id === 2) {
      // School admin only sees their organization
      whereClause = "WHERE organization_id = ?";
      params = [currentUser.organization_id];
    }

    const [stats] = await connection.execute(
      `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN approval_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN role_id = 3 AND approval_status = 'pending' THEN 1 ELSE 0 END) as pending_teachers,
        SUM(CASE WHEN role_id = 4 AND approval_status = 'pending' THEN 1 ELSE 0 END) as pending_students
      FROM users 
      ${whereClause}
    `,
      params
    );

    await connection.end();

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("Error fetching approval stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
