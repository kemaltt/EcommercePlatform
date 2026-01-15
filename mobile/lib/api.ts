import axios from "axios";

import Constants from "expo-constants";

// For development, use the machine's local IP to allow physical devices to connect
// For production, use the environment variable or fallback URL
const getBaseUrl = () => {
  if (__DEV__) {
    // Machine's local IP detected earlier: 192.168.178.29
    // Using a more robust way to detect debugger host if possible,
    // but hardcoding the verified local IP is a safe fallback for this user.
    const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
    const devIp = debuggerHost;
    if (!devIp) {
      console.warn("Dev IP not detected. Using localhost as fallback.");
      return "http://localhost:5002/api";
    }
    return `http://${devIp}:5002/api`;
  }

  // Production URL (replace with actual when available)
  return (
    process.env.EXPO_PUBLIC_API_URL ||
    "https://ecommerceplatform-production.up.railway.app/api"
  );
};

const API_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Add any needed headers here
  return config;
});
