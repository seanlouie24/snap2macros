import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import OpenAI from "openai";
import axios from "axios";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const processMealImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Uploads image to Cloudinary
    const uploadRes = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "meal-images" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const imageUrl = uploadRes.secure_url;

    // Detects food via OpenAI
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `
        You are a food recognition assistant. Reply with a single natural language food description that Nutritionix can understand.
        Example: "1 large apple", "2 slices pepperoni pizza", "1 cup cooked rice".
      ` },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify the food in this image and reply ONLY with an Nutritionix-compatible ingredient line."
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const cleanedFood = visionResponse.choices[0].message.content.trim();
    const ingredients = [cleanedFood];

    const nutritionRes = await axios.post(
      "https://trackapi.nutritionix.com/v2/natural/nutrients",
      { query: cleanedFood },
      {
        headers: {
          "x-app-id": process.env.NUTRITION_APP_ID,
          "x-app-key": process.env.NUTRITION_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Nutritionix response:", nutritionRes.data); 

    const food = nutritionRes.data.foods?.[0];
    if (!food) {
      return res.status(404).json({ error: "No nutrition data found for this food." });
    }

    const calories = Math.round(food.nf_calories ?? 0);
    const protein = Math.round(food.nf_protein ?? 0);
    const carbs = Math.round(food.nf_total_carbohydrate ?? 0);
    const fat = Math.round(food.nf_total_fat ?? 0);

    // Save meal in Prisma
    const meal = await prisma.meal.create({
      data: {
        name: food.food_name || cleanedFood,
        calories,
        protein,
        carbs,
        fat,
        imageUrl,
        userId: req.user.id,
      },
    });

    res.status(201).json({ message: "Meal logged successfully", meal });
  } catch (err) {
    console.error("Meal upload error:", err);
    res.status(500).json({ error: err.message });
  }
};
