
import axios from "axios";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

import supabase from "../lib/supabaseClient.js";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Detect food -> fetch nutrition -> save meal
export const processMealImage = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({ error: "No image uploaded"});
        }

        const fileName = `${Date.now()}_${req.file.originalname}`;
        const { error: uploadError } = await supabase.storage
            .from("meal-images")
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true,
            });
        
        if (uploadError) {
            throw new Error(`Supabase upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from("meal-images")
            .getPublicUrl(fileName);
        
        const imageUrl = publicUrlData.publicUrl;
        

        // Detect food with OpenAI
        const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a food recognition assistant." },
                {
                    role: "user",
                    content: [ 
                        { type: "text", text: "What food is in this image? Reply with a single dish/ingredient name."},
                        { type: "image_url", image_url: { url: imageUrl } },
                    ],
                },
            ],
        });

        const detectedFood = visionResponse.choices[0].message.content.trim();

        // Fetch nutrition facts from Nutrition API
        const nutritionRes = await axios.get("https://api.edamam.com/api/nutrition-data", {
            params: {
                app_id: process.env.NUTRITION_API_ID,
                app_key: process.env.NUTRITION_API_KEY,
                ingr: detectedFood,
            },
        });

        const data = nutritionRes.data;

        const calories = Math.round(data.calories || 0);
        const protein = Math.round(data.totalNutrients.PROCNT?.quantity || 0);
        const carbs = Math.round(data.totalNutrients.CHOCDF?.quantity || 0);
        const fat = Math.round(data.totalNutrients.FAT?.quantity || 0);

        // Save meal in DataBase
        const meal = await prisma.meal.create({
            data: {
                name: detectedFood,
                calories,
                protein,
                carbs,
                fat,
                image_url: imageUrl,
                userId: req.user.id,
            },
        });

        res.json({ message: "Meal logged from image", meal});
    } catch (err){
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};