import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

import auth from "./routes/auth";
import ai from "./routes/ai";
import goals from "./routes/goals";
import meals from "./routes/meals";

dotenv.config()
const app = express()
const prisma = new PrismaClient()

app.use(cors());
app.use(express.json());

// Routes:
app.use("/auth", auth);
app.use("/ai", ai);
app.use("/goals", goals);
app.use("/meals", meals);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log('Server running on https://localhost:${PORT}');
});
