import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import path from "path";

import auth from "./routes/auth.js";
import ai from "./routes/ai.js";
import goals from "./routes/goals.js";
import meals from "./routes/meals.js";

dotenv.config()
const app = express()
const prisma = new PrismaClient()

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(cors());
app.use(express.json());

// Routes:
app.use("/auth", auth);
app.use("/ai", ai);
app.use("/goals", goals);
app.use("/meals", meals);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
