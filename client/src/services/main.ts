import axios from "axios";

const api = axios.create({
  baseURL: "/api",     // ⚡ passe par le proxy Vite
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export default api;
