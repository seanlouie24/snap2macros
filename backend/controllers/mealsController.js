
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
export const updateMeal = async (req, res) => {
    try{
        const { id } = req.params;
        const { name, calories, protein, carbs, fat } = req.body;

        const meal = await prisma.meal.findUnique({ where: {id: Number(id) }});
        if (!meal || meal.userId !== req.user.id) {
            return res.status(404).json({ error: "Meal not found" });
        }

        const updated = await prisma.meal.update({
            where: { id: Number(id) },
            data: { name, calories, protein, carbs, fat},
        });

        res.json({ message: "Meal updated", meal: updated});
    } catch (err){
        res.status(500).json({error: err.message});
    }
};

// Delete a meal
export const deleteMeal = async (req, res) => {
    try{
        const { id } = req.params;

        const meal = await prisma.meal.findUnique({ where: {id: Number(id)}});
        if (!meal || meal.userId !== req.user.id){
            return res.status(404).json({error: "Meal not found"});
        }

        await prisma.meal.delete({ where: { id: Number(id) }});

        res.json({ message: "Meal deleted" });
    } catch (err){
        res.status(500).json({error: err.message});
    }
};