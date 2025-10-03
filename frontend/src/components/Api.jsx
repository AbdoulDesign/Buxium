// src/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // important : envoie aussi le cookie HttpOnly (refresh_token)
});

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const clearAccessToken = () => {
  accessToken = null;
};
export const getAccessToken = () => accessToken;

/* ---- Gestion du refresh (mutex + file d’attente) ---- */
let isRefreshing = false;
let subscribers = [];

function subscribeTokenRefresh(cb) {
  subscribers.push(cb);
}
function onRefreshed(newToken) {
  subscribers.forEach((cb) => cb(newToken));
  subscribers = [];
}

async function performRefresh() {
  // Si déjà en cours de refresh, attendre que ça se termine
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((token) => {
        if (token) resolve(token);
        else reject(new Error("Échec du refresh"));
      });
    });
  }

  isRefreshing = true;
  try {
    // Appel du endpoint refresh ; il lit le refresh_token depuis le cookie côté serveur
    const res = await api.post("accounts/token/refresh/", {}, { withCredentials: true });
    const newAccess = res.data.access;
    setAccessToken(newAccess);
    onRefreshed(newAccess);
    return newAccess;
  } catch (err) {
    onRefreshed(null);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

/* ---- Intercepteur des requêtes : attacher l’access token s’il existe ---- */
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/* ---- Intercepteur des réponses : en cas de 401, tenter un refresh une seule fois 
        (sauf pour login/refresh/verify afin d’éviter les boucles) ---- */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;

    // ne pas tenter de refresh pour ces endpoints (évite la récursion infinie)
    const skipRefreshFor = [
      "accounts/token/refresh/",
      "accounts/auth/login/",
      "accounts/auth/verify/",
    ];

    // normaliser l’URL (peut être absolue ou relative)
    const reqUrl = originalRequest.url ?? originalRequest;

    const shouldSkip = skipRefreshFor.some(
      (path) => reqUrl.endsWith(path) || reqUrl.includes(path)
    );

    if (status === 401 && !originalRequest._retry && !shouldSkip) {
      originalRequest._retry = true;
      try {
        const newToken = await performRefresh(); // lance le refresh (échoue si refresh invalide)
        // attacher le nouveau token et rejouer la requête initiale
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        clearAccessToken();
        // rediriger vers login (pas de boucle infinie)
        window.location.href = "/auth/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

/* ---- Fonctions utilitaires ---- */
export const login = async (username, password) => {
  // login retourne access + user (le backend met en place le refresh cookie)
  const res = await api.post(
    "accounts/auth/login/",
    { username, password },
    { withCredentials: true }
  );
  // res.data contient { access: "...", user: {...} } car le serializer inclut l’utilisateur
  const { access, user } = res.data;
  if (access) setAccessToken(access);
  return { access, user };
};

export const attemptRefresh = async () => {
  // tente de refresh (lecture du cookie côté serveur). retourne un nouveau access ou échoue
  return performRefresh();
};

export const fetchMe = async () => {
  const res = await api.get("accounts/auth/me/", { withCredentials: true });
  return res.data;
};

export default api;
