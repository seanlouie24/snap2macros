// lib/api.ts
import axios from "axios";
import supabase from "./supabase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050",
});

// Attach JWT from Supabase before each request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession(); // v2 API
  const token = session?.access_token;

  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

export default api;
