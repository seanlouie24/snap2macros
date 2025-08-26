
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { processMealImage } from "../controllers/aiController.js";

const router = express.Router();

router.post("upload", authMiddleware, upload.single("image"), processMealImage);

export default router;