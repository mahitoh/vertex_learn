import { Router, Request, Response } from "express";
import { prisma } from "../config/database.js";
import { validatePagination, validateId } from "../middleware/validation.js";
import { requireAdmin } from "../middleware/auth.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// Get all verifications with pagination and filters
router.get(
  "/",
  validatePagination,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { search, role, status, page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {
        ...(search
          ? {
              user: {
                OR: [
                  { name: { contains: search as string, mode: "insensitive" } },
                  {
                    email: { contains: search as string, mode: "insensitive" },
                  },
                ],
              },
            }
          : {}),
        ...(role
          ? { role: { equals: role as string, mode: "insensitive" } }
          : {}),
        ...(status
          ? { status: { equals: status as string, mode: "insensitive" } }
          : {}),
      };

      const verifications = await prisma.verification.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
              email: true,
              employeeId: true,
              studentId: true,
              department: true,
              position: true,
              organization: true,
            },
          },
        },
        orderBy: { submissionDate: "desc" },
      });

      const total = await prisma.verification.count({ where });

      res.json({
        data: verifications,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      });
    } catch (error) {
      console.error("Get verifications error:", error);
      res.status(500).json({
        error: "Internal server error while fetching verifications",
      });
    }
  }
);

// Get verification statistics
router.get(
  "/stats/overview",
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const totalVerifications = await prisma.verification.count();
      const pendingVerifications = await prisma.verification.count({
        where: { status: "pending" },
      });
      const verifiedCount = await prisma.verification.count({
        where: { status: "verified" },
      });
      const rejectedCount = await prisma.verification.count({
        where: { status: "rejected" },
      });

      const verificationsByRole = await prisma.verification.groupBy({
        by: ["role"],
        _count: { id: true },
      });

      const verificationsByStatus = await prisma.verification.groupBy({
        by: ["status"],
        _count: { id: true },
      });

      const recentVerifications = await prisma.verification.findMany({
        take: 5,
        orderBy: { submissionDate: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      res.json({
        totalVerifications,
        pendingVerifications,
        verifiedCount,
        rejectedCount,
        verificationsByRole,
        verificationsByStatus,
        recentVerifications,
      });
    } catch (error) {
      console.error("Get verification stats error:", error);
      res.status(500).json({
        error: "Internal server error while fetching verification statistics",
      });
    }
  }
);

// Get verification by ID
router.get(
  "/:id",
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
        return res.status(400).json({
          errors: [
            {
              field: "id",
              message: "ID must be a positive integer",
              value: id,
            },
          ],
        });
      }

      const verification = await prisma.verification.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
              email: true,
              employeeId: true,
              studentId: true,
              department: true,
              position: true,
              organization: true,
            },
          },
        },
      });

      if (!verification) {
        return res.status(404).json({
          error: "Verification not found",
        });
      }

      res.json({ verification });
    } catch (error) {
      console.error("Get verification error:", error);
      res.status(500).json({
        error: "Internal server error while fetching verification",
      });
    }
  }
);

// Approve verification
router.post(
  "/approve/:id",
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
        return res.status(400).json({
          errors: [
            {
              field: "id",
              message: "ID must be a positive integer",
              value: id,
            },
          ],
        });
      }
      const { comments } = req.body;
      const adminId = req.user!.id;

      // Check if verification exists and is pending
      const verification = await prisma.verification.findUnique({
        where: { id: parseInt(id) },
        include: { user: true },
      });

      if (!verification) {
        return res.status(404).json({
          error: "Verification not found",
        });
      }

      if (verification.status !== "pending") {
        return res.status(400).json({
          error: "Verification is not in pending status",
        });
      }

      // Update verification status
      const updatedVerification = await prisma.verification.update({
        where: { id: parseInt(id) },
        data: {
          status: "verified",
          comments: comments || verification.comments,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create notification for the user
      await prisma.notification.create({
        data: {
          message: `Your verification for ${
            verification.role
          } role has been approved${comments ? `: ${comments}` : ""}`,
          recipientId: verification.userId,
          senderId: adminId,
          type: "verification",
          status: "unread",
        },
      });

      res.json({
        message: "Verification approved successfully",
        verification: updatedVerification,
      });
    } catch (error) {
      console.error("Approve verification error:", error);
      res.status(500).json({
        error: "Internal server error while approving verification",
      });
    }
  }
);

// Reject verification
router.post(
  "/reject/:id",
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
        return res.status(400).json({
          errors: [
            {
              field: "id",
              message: "ID must be a positive integer",
              value: id,
            },
          ],
        });
      }
      const { comments } = req.body;
      const adminId = req.user!.id;

      // Check if verification exists and is pending
      const verification = await prisma.verification.findUnique({
        where: { id: parseInt(id) },
        include: { user: true },
      });

      if (!verification) {
        return res.status(404).json({
          error: "Verification not found",
        });
      }

      if (verification.status !== "pending") {
        return res.status(400).json({
          error: "Verification is not in pending status",
        });
      }

      if (!comments) {
        return res.status(400).json({
          error: "Comments are required when rejecting a verification",
        });
      }

      // Update verification status
      const updatedVerification = await prisma.verification.update({
        where: { id: parseInt(id) },
        data: {
          status: "rejected",
          comments,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create notification for the user
      await prisma.notification.create({
        data: {
          message: `Your verification for ${verification.role} role has been rejected: ${comments}`,
          recipientId: verification.userId,
          senderId: adminId,
          type: "verification",
          status: "unread",
        },
      });

      res.json({
        message: "Verification rejected successfully",
        verification: updatedVerification,
      });
    } catch (error) {
      console.error("Reject verification error:", error);
      res.status(500).json({
        error: "Internal server error while rejecting verification",
      });
    }
  }
);

// Get verification documents
router.get(
  "/:id/documents",
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
        return res.status(400).json({
          errors: [
            {
              field: "id",
              message: "ID must be a positive integer",
              value: id,
            },
          ],
        });
      }

      const verification = await prisma.verification.findUnique({
        where: { id: parseInt(id) },
        select: { documents: true },
      });

      if (!verification) {
        return res.status(404).json({
          error: "Verification not found",
        });
      }

      res.json({
        documents: verification.documents,
      });
    } catch (error) {
      console.error("Get verification documents error:", error);
      res.status(500).json({
        error: "Internal server error while fetching verification documents",
      });
    }
  }
);

export default router;
