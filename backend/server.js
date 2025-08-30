import dotenv from "dotenv";
import express from "express";
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

const allowedOrigins = [
    "http://localhost:3000",               // Local dev
    "https://snap2macros.vercel.app"      // Vercel production
  ];  

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like Postman) or if origin is in allowedOrigins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );
  
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
