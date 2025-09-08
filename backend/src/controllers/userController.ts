import { Request, Response } from "express";
import { UserService } from "../services/userService.js";

// User Controller
export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const { search, department, page = 1, limit = 10 } = req.query;

      const result = await UserService.getUsersWithPagination({
        search: search as string,
        department: department as string,
        page: Number(page),
        limit: Number(limit),
      });

      res.json({
        success: true,
        data: result.users,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.findUserById(Number(id));

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const {
        name,
        email,
        password,
        roleId,
        department,
        employeeId,
        organizationId,
      } = req.body;

      const userData: any = {
        name,
        email,
        password,
        roleId: Number(roleId),
        department,
        employeeId,
      };

      if (organizationId) {
        userData.organizationId = Number(organizationId);
      }

      const user = await UserService.createUser(userData);

      res.status(201).json({ success: true, data: user });
    } catch (error) {
      console.error("Error creating user:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, department, roleId, organizationId } = req.body;

      const updateData: any = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (department) updateData.department = department;
      if (roleId) updateData.roleId = Number(roleId);
      if (organizationId !== undefined)
        updateData.organizationId = organizationId
          ? Number(organizationId)
          : null;

      const user = await UserService.updateUser(Number(id), updateData);

      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Error updating user:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await UserService.deleteUser(Number(id));

      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}
