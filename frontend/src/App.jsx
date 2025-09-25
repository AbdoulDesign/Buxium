import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';

// ---- Pages publiques ----
import LandingPage from "./components/pages/landingPage/LandingPage";
import Login from "./components/auth/Login";

// ---- Dashboard et sous-pages ----
import Dashboard from "./components/Dashboard";
import TableauDeBord from "./components/TableauDeBord";
import Ventes from "./components/pages/ventes/Ventes";
import Produits from "./components/pages/produits/Produits";
import Stock from "./components/pages/stocks/Stock";
import Achats from "./components/pages/achats/Achats";
import Caisse from "./components/pages/caisse/Caisse";
import Clients from "./components/pages/clients/Clients";
import Fournisseurs from "./components/pages/fournisseurs/Fournisseurs";
import Parametres from "./components/pages/gestionStocks/parametres/Parametres";
import Utilisateurs from "./components/pages/gestionStocks/utilisateurs/Utilisateurs";
import Commande from "./components/pages/restaurants/commandes/Commande";
import Menu from "./components/pages/restaurants/menu/Menu";
import Entrees from "./components/pages/gestionStocks/entrees/Entrees";
import Sorties from "./components/pages/gestionStocks/sorties/Sorties";
import Inventaire from "./components/pages/gestionStocks/inventaires/Inventaire";
import FinancePage from "./components/pages/gestionStocks/finance/FinancePage";
import GestionStockPage from "./components/pages/gestionStocks/rapport_analyse/RapportAnalyse";
import ListeMarchandises from "./components/pages/gestionStocks/marchandise/ListeMarchandises";
import Fournisseur from "./components/pages/gestionStocks/fournisseurs/Fournisseur";
import PageAide from "./components/pages/gestionStocks/aide/PageAide";
import PageAbonnement from "./components/pages/gestionStocks/abonnement/PageAbonnement";

// ---- Auth & Protection ----
import { AuthProvider } from "./hooks/useAuth";
import PrivateRoute from "./components/PrivateRoute";
import DetailAbonnement from "./components/pages/gestionStocks/abonnement/DetailAbonnement";
import SignupBoutique from "./components/signup/SignupBoutique";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/inscription" element={<SignupBoutique/>} />

          {/* Routes dashboard protégées */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<TableauDeBord />} />
            <Route path="tableau-de-bord" element={<TableauDeBord />} />
            <Route path="marchandises" element={<ListeMarchandises />} />
            <Route path="entrees" element={<Entrees />} />
            <Route path="sorties" element={<Sorties />} />
            <Route path="inventaires" element={<Inventaire />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="fournisseurs" element={<Fournisseur />} />
            <Route path="utilisateurs" element={<Utilisateurs />} />
            <Route path="parametres" element={<Parametres />} />
            <Route path="rapports" element={<GestionStockPage />} />
            <Route path="abonnement" element={<PageAbonnement />} />
            <Route path="abonnement/:id" element={<DetailAbonnement/>} />
            <Route path="aides" element={<PageAide />} />
            <Route path="commandes" element={<Commande />} />
            <Route path="menu" element={<Menu />} />
            <Route path="ventes" element={<Ventes />} />
            <Route path="produits" element={<Produits />} />
            <Route path="stocks" element={<Stock />} />
            <Route path="achats" element={<Achats />} />
            <Route path="caisse" element={<Caisse />} />
            <Route path="clients" element={<Clients />} />
            <Route path="fourni" element={<Fournisseurs />} />
          </Route>

          {/* Redirection par défaut si page non trouvée */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
