import express from "express";
import postController from "../controllers/admin/postController";
import authMiddleware from "../middleware/auth";
const router = express.Router();

//[GET] /index post
router.get("/admin/post", authMiddleware.roleAdmin, postController.index);

// [GET] /censorship post
router.get("/admin/post/censorship/:id",authMiddleware.roleAdmin, postController.censorship);

// [GET] || [POST] /create post
router.get("/post/create", authMiddleware.roleAdminOrUser, postController.create);
router.post("/post/create", authMiddleware.roleAdminOrUser, postController.store);

// [GET] || [POST] /edit post
router.get("/post/edit/:id", authMiddleware.roleAdminOrUser, postController.edit);
router.post("/post/edit/:id", authMiddleware.roleAdminOrUser, postController.update);

// [GET] /delete post
router.get("/admin/post/delete/:id",  authMiddleware.roleAdmin, postController.delete);

//[GET] /show post detail
router.get("/post/detail/:slug", postController.details);

//GET /post/search
router.get("/post/search", postController.searchPost);

// [GET] /my post
router.get("/post/my-post", authMiddleware.roleAdminOrUser, postController.myPost);

// [GET] /comment post
router.get("/admin/post/comment", authMiddleware.roleAdmin, postController.indexComment);

// [GET] /censorship comment
router.get("/admin/post/comment/censorship/:id", authMiddleware.roleAdmin,  postController.censorshipComment);

// [POST] / create comment post
router.post("/post/comment/:id", authMiddleware.roleAdminOrUser, postController.createComment);

// [GET] /delete comment post
router.get("/admin/post/comment/delete/:id",authMiddleware.roleAdmin, postController.deleteComment);

// [GET] /audio post
router.get("/admin/post/audio/:id", authMiddleware.roleAdmin, postController.createAudio);
// [GET] / Delete audio post
router.get("/admin/post/audio/delete/:id", authMiddleware.roleAdmin, postController.deleteAudio);
export default router;