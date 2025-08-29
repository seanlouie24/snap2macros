
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {PrismaClient} from "@prisma/client";

// Calling the database
const prisma = new PrismaClient();

// Function for signup requesting and responding
export const signup = async (req, res) => {
    try{
        // Pulling the email and password from db
        const {email, password} = req.body;

        // check if email already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: "Email already in use" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {email, password: hashed },
        });
        
        const { password: _, ...userSafe } = user;
        res.status(201).json({message: "User created", user: userSafe });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req,res) => {
    try{
        const {email, password} = req.body;

        const user = await prisma.user.findUnique({ where: {email} });
        
        const match = user ? await bcrypt.compare(password, user.password) : false;

        if(!user || !match) return res.status(401).json({message: "Invalid email or password" });

        

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({ message: "Login successful", token});
    } catch (err){
        res.status(500).json({message: err.message});
    }
};