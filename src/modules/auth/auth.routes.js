import express from "express";
import AuthController from "./auth.controller.js";
import authenticate from "./auth.middleware.js";
const router = express.Router();
const authController = new AuthController();
router.post("/register", authController.registerController);
router.post("/login", authController.loginController);
router.get(
  "/refresh",
  authController.refreshAccessTokenController,
);
export default router;
