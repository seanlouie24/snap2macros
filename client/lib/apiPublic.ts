// lib/apiPublic.ts
import axios from "axios";

const apiPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050",
});

export default apiPublic;
