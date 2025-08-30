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
        { role: "system", content: "You are a food recognition assistant." },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What food is in this image? Reply with a single dish or ingredient name.",
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const detectedFood = visionResponse.choices[0].message.content.trim();

    // Fetchs nutrition info from Edamam
    const nutritionRes = await axios.get("https://api.edamam.com/api/nutrition-data", {
      params: {
        app_id: process.env.NUTRITION_APP_ID,
        app_key: process.env.NUTRITION_API_KEY,
        ingr: detectedFood,
      },
    });

    const nutrition = nutritionRes.data;

    const calories = Math.round(nutrition.calories || 0);
    const protein = Math.round(nutrition.totalNutrients?.PROCNT?.quantity || 0);
    const carbs = Math.round(nutrition.totalNutrients?.CHOCDF?.quantity || 0);
    const fat = Math.round(nutrition.totalNutrients?.FAT?.quantity || 0);

    // Saves meal in Prisma
    const meal = await prisma.meal.create({
      data: {
        name: detectedFood,
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
