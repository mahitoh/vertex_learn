"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post("/register", validation_1.validateRegister, authController_1.AuthController.register);
router.post("/login", validation_1.validateLogin, authController_1.AuthController.login);
router.post("/logout", authController_1.AuthController.logout);
router.get("/me", auth_1.authenticateToken, authController_1.AuthController.getCurrentUser);
router.put("/change-password", auth_1.authenticateToken, validation_1.validateChangePassword, authController_1.AuthController.changePassword);
router.put("/reset-password/:userId", auth_1.authenticateToken, auth_1.requireAdmin, validation_1.validateResetPassword, authController_1.AuthController.resetPassword);
router.put("/deactivate/:userId", auth_1.authenticateToken, auth_1.requireAdmin, validation_1.validateUserId, authController_1.AuthController.deactivateUser);
router.put("/activate/:userId", auth_1.authenticateToken, auth_1.requireAdmin, validation_1.validateUserId, authController_1.AuthController.activateUser);
exports.default = router;
//# sourceMappingURL=auth.js.map