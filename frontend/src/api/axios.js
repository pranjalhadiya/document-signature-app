import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL.https://document-signature-app-ich9.onrender.com,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;