import axios from "axios";
import { sessionStorage } from "../modules/auth/services/session.storage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getToken();

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});
