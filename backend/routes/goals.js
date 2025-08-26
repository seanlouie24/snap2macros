
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { setGoal, getGoal} from "../controllers/goalsController.js";

const router = express.Router();

router.post("/", authMiddleware, setGoal);
router.get("/", authMiddleware, getGoal);

export default router;