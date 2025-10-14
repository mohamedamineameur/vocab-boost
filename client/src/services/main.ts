import axios from "axios";

// Configuration de l'API selon l'environnement
const getBaseURL = () => {
  // En production, utilise l'URL absolue du serveur
  if (import.meta.env.PROD) {
    // En production, l'API est servie par le même serveur
    return "/api";
  }
  // En développement, utilise le proxy Vite
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export default api;
