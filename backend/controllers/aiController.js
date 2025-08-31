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
        You are a food recognition assistant. 
        Only reply with a **single ingredient line** recognized by the Edamam Nutrition API.
        Format: <quantity> <unit> <food name>, e.g. "1 large apple", "2 slices pepperoni pizza", "1 cup cooked rice".
        Do not include any extra explanation, text, or punctuation.
      ` },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify the food in this image and reply ONLY with an Edamam-compatible ingredient line."
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const cleanedFood = visionResponse.choices[0].message.content.trim();
    const ingredients = [cleanedFood];

    const nutritionRes = await axios.post(
      `https://api.edamam.com/api/nutrition-details?app_id=${process.env.NUTRITION_APP_ID}&app_key=${process.env.NUTRITION_API_KEY}`, // ✅ CHANGED: POST endpoint
      {
        title: cleanedFood,
        ingr: ingredients,  
      }
    );

    console.log("Edamam response:", nutritionRes.data); 
    console.log("Parsed ingredients:", nutritionRes.data.ingredients); 

    const nutrition = nutritionRes.data;

    const firstParsed = nutrition.ingredients?.[0]?.parsed?.[0]?.nutrients || {};

    const calories = Math.round(nutrition.calories ?? firstParsed.ENERC_KCAL?.quantity ?? 0);
    const protein = Math.round(nutrition.totalNutrients?.PROCNT?.quantity ?? firstParsed.PROCNT?.quantity ?? 0);
    const carbs = Math.round(nutrition.totalNutrients?.CHOCDF?.quantity ?? firstParsed.CHOCDF?.quantity ?? 0);
    const fat = Math.round(nutrition.totalNutrients?.FAT?.quantity ?? firstParsed.FAT?.quantity ?? 0);

    // Saves meal in Prisma
    const meal = await prisma.meal.create({
      data: {
        name: cleanedFood, 
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
