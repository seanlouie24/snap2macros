
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {createMeal, getMeal, updateMeal, deleteMeal} from "../controllers/mealsController.js";

const router = express.Router();

router.post("/", authMiddleware, createMeal);
router.get("/", authMiddleware, getMeal);
router.put("/:id", authMiddleware, updateMeal);
router.delete("/id", authMiddleware, deleteMeal);

export default router;