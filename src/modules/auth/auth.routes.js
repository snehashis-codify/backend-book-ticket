import express from "express";
import AuthController from "./auth.controller.js";
const router = express.Router();
const authController = new AuthController();
router.post("/register", authController.registerController);
router.post("/login", authController.loginController);
export default router;
