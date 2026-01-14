import axios from "axios";

// Update this with your machine's local IP address for physical device testing
// Or use localhost for simulator/emulator
const API_URL = "http://localhost:5002/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Add any needed headers here
  return config;
});
