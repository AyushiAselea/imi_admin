import axios from "axios";

// In dev: Vite proxy forwards /api → localhost:5000 (see vite.config.ts)
// In production (Vercel): VITE_API_URL must be set, or falls back to Render URL
const baseURL = (import.meta.env.VITE_API_URL || "https://imi-backend-s85v.onrender.com/api").replace(/\/+$/, "");

const api = axios.create({
  baseURL,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401/403
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
