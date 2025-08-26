
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Set or update weekly goal
export const setGoal = async (req, res) =>{
    try{
        const { weeklyCalories } = req.body;

        if (!weeklyCalories || weeklyCalories <= 0) {
            return res.status(400).json({ error: "Weekly calories must be greator than 0"});
        }

        // Check if there is a existing goal
        const existingGoal = await prisma.goal.findFirst({
            where: { userId: req.user.id},
        });

        let goal;
        if (existingGoal){
            //Update the existing goal
            goal = await prisma.goal.update({
                where:{ id: existingGoal.id},
                data: { weeklyCalories },
            });
        } else {
            // No existing goal create one
            goal = await prisma.goal.create({
                data:{
                    userId: req.user.id,
                    weeklyCalories,
                },
            });
        }
        res.json({ message: "Goal saved", goal });
    } catch (err){
        res.status(500).json({ error: err.message });
    }
};

// Get current goal
export const getGoal = async (req, res) => {
    try{
        const goal = await prisma.goal.findFirst({
            where: { userId: req.user.id },
        });

        if (!goal) return res.status(404).json({ error: "No goal set "});

        res.json(goal);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
}; 