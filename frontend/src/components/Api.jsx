// src/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const clearAccessToken = () => {
  accessToken = null;
};
export const getAccessToken = () => accessToken;

/* ---- Gestion du refresh améliorée ---- */
let isRefreshing = false;
let subscribers = [];

function subscribeTokenRefresh(cb) {
  subscribers.push(cb);
}

function onRefreshed(token) {
  subscribers.forEach(cb => cb(token));
  subscribers = [];
}

async function performRefresh() {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((token) => {
        token ? resolve(token) : reject(new Error("Refresh failed"));
      });
    });
  }

  isRefreshing = true;
  
  try {
    const res = await api.post("accounts/token/refresh/", {}, { 
      withCredentials: true,
      // Empêcher l'intercepteur de traiter cette requête
      _skipAuth: true 
    });
    
    const newAccess = res.data.access;
    setAccessToken(newAccess);
    onRefreshed(newAccess);
    return newAccess;
  } catch (err) {
    onRefreshed(null);
    clearAccessToken();
    throw err;
  } finally {
    isRefreshing = false;
  }
}

/* ---- Intercepteur request ---- */
api.interceptors.request.use((config) => {
  if (accessToken && !config._skipAuth) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/* ---- Intercepteur response CORRIGÉ ---- */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Éviter les boucles infinies
    if (!originalRequest || 
        originalRequest._retry || 
        originalRequest._skipAuth) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    
    // URLs qui ne doivent PAS déclencher de refresh
    const skipRefreshEndpoints = [
      "accounts/auth/login/",
      "accounts/auth/logout/",
      "accounts/token/verify/"
    ];
    
    const shouldSkipRefresh = skipRefreshEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    if (status === 401 && !shouldSkipRefresh) {
      originalRequest._retry = true;
      
      try {
        const newToken = await performRefresh();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // En cas d'échec du refresh, nettoyer et rediriger
        clearAccessToken();
        // Ne rediriger QUE si on est pas déjà sur la page login
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

/* ---- Fonctions utilitaires améliorées ---- */
export const login = async (username, password) => {
  const res = await api.post(
    "accounts/auth/login/",
    { username, password },
    { 
      withCredentials: true,
      _skipAuth: true // Ne pas utiliser l'intercepteur pour le login
    }
  );
  
  const { access, user } = res.data;
  if (access) setAccessToken(access);
  return { access, user };
};

export const attemptRefresh = async () => {
  try {
    return await performRefresh();
  } catch (err) {
    clearAccessToken();
    throw err;
  }
};

export const fetchMe = async () => {
  try {
    const res = await api.get("accounts/auth/me/");
    return res.data;
  } catch (err) {
    // Si /me retourne 401, c'est normal si pas authentifié
    if (err.response?.status === 401) {
      clearAccessToken();
      throw new Error("Not authenticated");
    }
    throw err;
  }
};

export default api;