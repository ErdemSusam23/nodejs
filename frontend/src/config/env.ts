export const API_URL = import.meta.env.VITE_API_URL || "https://nodejs-production-fb070.up.railway.app/api"
if (!import.meta.env.VITE_API_URL)
  throw new Error("VITE_API_URL missing")

