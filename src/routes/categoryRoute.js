import express from "express";
import authMiddleware from "../middleware/auth";
import categoryController from "../controllers/admin/categoryController";
const router = express.Router();

//[GET] /index Category
router.get("/admin/category",authMiddleware.roleAdmin, categoryController.index);

//[GET] || [POST] /create Category
router.get("/admin/category/create",authMiddleware.roleAdmin, categoryController.create);
router.post("/admin/category/create",authMiddleware.roleAdmin, categoryController.store);

//[GET] || [POST] /edit Category
router.get("/admin/category/edit/:id",authMiddleware.roleAdmin, categoryController.edit);
router.post("/admin/category/edit/:id",authMiddleware.roleAdmin, categoryController.update);

//[POST] /delete Category
router.get("/admin/category/delete/:id",authMiddleware.roleAdmin, categoryController.delete);

//[GET] / get all post by category
router.get("/category/:slug", categoryController.getPostByCategory);

export default router;