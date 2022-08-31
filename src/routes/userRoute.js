import express from "express";
import userController from "../controllers/admin/userController";
import authMiddleware from "../middleware/auth";
const router = express.Router();

//[GET] /index users
router.get("/admin/user", authMiddleware.roleAdmin, userController.index);

// [GET] /index users restore
router.get("/admin/user/restore", authMiddleware.roleAdmin, userController.indexRestore);
router.get("/admin/user/restore/:id", authMiddleware.roleAdmin, userController.restore);

// [GET] /user/create
router.get("/admin/user/create", authMiddleware.roleAdmin, userController.create);
router.post("/admin/user/create", authMiddleware.roleAdmin, userController.store);

//[GET] /use/edit/:id
router.get("/admin/user/edit/:id", authMiddleware.roleAdmin, userController.edit);
router.post("/admin/user/edit/:id", authMiddleware.roleAdmin, userController.update);

// [GET] /use/delete/:id
router.get("/admin/user/delete/:id", authMiddleware.roleAdmin, userController.delete);

//[GET] /censorship user
router.get("/admin/user/censorship/:id", authMiddleware.roleAdmin, userController.censorship);

export default router;