
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authMiddleware = async(req, res) => {
    try{
        const authHeader = req.headers["authorization"];
        if(!authHeader || !authHeader.startswith("Bearer ")){
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({where: {id: decoded.id}});
        if (!user) return res.status(401).json({error: "User not found" });

        req.user = user;
        next();
    } catch(err){
        console.error("Auth error:", err);
        res.status(401).json({ error: "Unauthorized" });
    }
};