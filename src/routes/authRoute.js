import express from "express";
import authController from "../controllers/auth/authController";
const router = express.Router();

// [GET] || [POST] / login
router.get("/login", authController.index);
router.post("/login", authController.login);

// [GET] || [POST] / register
router.get("/register", authController.indexRegister);
router.post("/register", authController.register);

// [GET] 
router.get("/logout", authController.logout);

export default router;