
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Creating a Meal
export const createMeal = async (req, res) => {
    try{
        const { name, calories, protein, carbs, fat } = req.body;

        const meal = await prisma.meal.create({
            data: {
                name,
                calories: Number(calories),
                protein: protein ? Number(protein) : null,
                carbs: carbs ? Number(carbs) : null,
                fat: fat ? Number(fat) : null,
                // Comes from authMiddleware
                userId: req.user.id,
            },
        });
        res.status(201).json({ message: "Meal created", meal});
    } catch (err){
        res.status(500).json({ error: err.message});
    }
};

// Get all meals for logged-in user:
export const getMeal = async (req,res) => {
    try{
        const meals = await prisma.meal.findMany({
            where: { userId: req.user.id},
            orderBy: { createdAt: "desc"},
        });
        res.json(meals);
    } catch (err){
        res.status(500).json({ error: err.message });
    }
};

// Update a meal