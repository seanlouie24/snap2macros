// types

export interface Meal {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    imageUrl?: string;
    createdAt: string;
}

export interface AiResponse {
    message: string
    meal: Meal
  }

export interface Goal {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}