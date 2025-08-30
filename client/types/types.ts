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
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    imageUrl?: string;
}

export interface Goal {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}