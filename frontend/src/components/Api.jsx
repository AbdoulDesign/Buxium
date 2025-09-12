import axios from "axios";

const API_URL = "http://localhost:8000/api"; // ton API root

// Création d'une instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter automatiquement le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer le refresh token automatiquement
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 et pas déjà en train de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Refresh token manquant");
        }

        // Appel API pour régénérer un access token
        const res = await axios.post(`${API_URL}/accounts/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;

        // Sauvegarde du nouveau token
        localStorage.setItem("accessToken", newAccessToken);

        // Réessaie la requête initiale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token invalide :", refreshError);
        // Nettoyage + redirection login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Connexion utilisateur / entreprise
 */
export const login = async (username, password) => {
  try {
    const response = await api.post("/accounts/auth/login/", {
      username,
      password,
    });

    const { access, refresh, ...infos } = response.data;

    // Stocker les tokens
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    // Stocker infos utilisateur/entreprise
    localStorage.setItem("userData", JSON.stringify(infos));

    return response.data;
  } catch (err) {
    console.error("Erreur de connexion :", err.response?.data || err.message);
    throw err;
  }
};

export default api;
