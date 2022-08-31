import express from "express";

import homeController from "../controllers/user/homeController";

const router = express.Router();

router.get("/", homeController.index);

export default router;