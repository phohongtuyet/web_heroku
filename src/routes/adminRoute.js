import express from "express";
import authController from "../controllers/auth/authController";
import authMiddleware from "../middleware/auth";
const router = express.Router();

router.get("/admin", authMiddleware.roleAdmin,  authController.indexAdmin);

export default router;