// src/hooks/useAuth.js
import { createContext, useContext, useEffect, useState } from "react";
import api, { 
  login as apiLogin, 
  fetchMe, 
  attemptRefresh, 
  setAccessToken, 
  clearAccessToken 
} from "../components/Api";


// Création du contexte d'authentification
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);        // utilisateur connecté
  const [loading, setLoading] = useState(true);  // état de chargement

  /**
   * Initialisation : 
   * 1. On tente d'abord de rafraîchir le token (cookie HTTP-only)
   * 2. Si succès -> on récupère les infos utilisateur avec /auth/me
   * 3. Sinon -> utilisateur non authentifié
   */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await attemptRefresh();       // tente de récupérer un nouveau token d'accès
        const me = await fetchMe();   // récupère l'utilisateur connecté
        if (mounted) setUser(me);
      } catch (err) {
        if (mounted) setUser(null);   // pas de session valide
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Connexion (login)
   * - Envoie username + password au backend
   * - Stocke le token d'accès en mémoire
   * - Met à jour l'état utilisateur
   */
  const signin = async (username, password) => {
    setLoading(true);
    try {
      const { access, user } = await apiLogin(username, password);

      if (access) setAccessToken(access); // stocke le token d'accès en mémoire
      setUser(user);                      // met à jour l'état utilisateur

      return user;
    } catch (err) {
      setUser(null);
      clearAccessToken();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnexion (logout)
   * - Supprime l'utilisateur du state
   * - Efface le token d'accès
   * - Redirige vers la page de login
   */
  const signout = async () => {
  try {
    // Appelle le backend pour invalider le refresh cookie
    await api.post("accounts/auth/logout/", {}, { withCredentials: true });
  } catch (err) {
    console.error("Erreur logout backend (continu quand même)", err);
  } finally {
    setUser(null);
    clearAccessToken(); // supprime access token en mémoire
    localStorage.clear(); // on nettoie tout pour éviter fuite
    window.location.href = "/auth/login";
  }
};

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        signin,
        signout, 
        loading, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte d'auth
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
};
