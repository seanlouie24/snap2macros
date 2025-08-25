
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {createMeal, getMeal, updateMeal, deleteMeal} from "../controllers/mealsController";

const router = express.Router();

router.post("/", authMiddleware, createMeal);
router.gett("/", authMiddleware, getMeal);
router.put("/:id", authMiddleware, updateMeal);
router.delete("/id", authMiddleware, deleteMeal);

export default router;