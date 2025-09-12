import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  Package,
  Star,
  AlertTriangle,
} from "lucide-react";
import { BiBarChart } from "react-icons/bi";

// ----- Composant carte statistique -----
const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-white shadow-lg rounded-2xl p-6 flex items-center justify-between"
  >
    <div>
      <p className={`text-sm font-medium ${color}`}>{label}</p>
      <p className="text-xl font-bold mt-2">{value}</p>
    </div>
    <Icon className={`w-10 h-10 ${color}`} />
  </motion.div>
);

// ----- Fonction pour générer statistiques par onglet -----
const getStatsForTab = (tab, data, currency) => {
  if (!data) return { cards: [], chartData: [], chartTitle: "", chartType: "bar" };

  switch (tab) {
    case "entrees": {
      const entree = data.entree;
      return {
        cards: [
          { icon: Package, label: "Articles en Entrée", value: entree.ArticleEnEntree, color: "text-gray-700" },
          { icon: ArrowUpCircle, label: "Valeur Entrées", value: `${entree.ValeurEntree.toLocaleString()} ${currency}`, color: "text-[#43AB8A]" },
          { icon: DollarSign, label: "Total Quantité", value: `${entree.QuantiteTotal.toLocaleString()} pcs`, color: "text-purple-600" },
          { icon: TrendingUp, label: "Variation Mensuelle", value: `${entree.VariationMois.toFixed(2)}%`, color: entree.VariationMois >= 0 ? "text-green-600" : "text-red-500" },
        ],
        chartData: Object.entries(entree.entreeParMois).map(([month, value]) => ({ month, value })),
        chartTitle: "📦 Entrées par mois",
        chartType: "bar",
      };
    }

    case "sorties": {
      const sortie = data.sortie;
      return {
        cards: [
          { icon: Package, label: "Articles en Sortie", value: sortie.ArticleEnSortie, color: "text-gray-700" },
          { icon: ArrowDownCircle, label: "Quantité Sorties", value: `${sortie.QuantiteSortie.toLocaleString()} pcs`, color: "text-[#43AB8A]" },
          { icon: Star, label: "Article le plus sorti", value: sortie.ArticleLePlusSortie, color: "text-yellow-500" },
          { icon: DollarSign, label: "Total Valeur", value: `${sortie.TotalValeur.toLocaleString()} ${currency}`, color: "text-purple-600" },
        ],
        chartData: Object.entries(sortie.sortieParMois).map(([month, value]) => ({ month, value })),
        chartTitle: "📤 Sorties par mois",
        chartType: "line",
      };
    }

    case "marchandises": {
      const marchandise = data.marchandise;
      return {
        cards: [
          { icon: Package, label: "Total Marchandises", value: marchandise.total_marchandise, color: "text-gray-700" },
          { icon: ArrowUpCircle, label: "Valeur Marchandises", value: `${marchandise.valeur_marchandise.toLocaleString()} ${currency}`, color: "text-[#43AB8A]" },
          { icon: ArrowDownCircle, label: "Articles en alerte", value: marchandise.marchandise_alertes, color: "text-red-500" },
          { icon: TrendingUp, label: "Stock Moyen", value: marchandise.stock_moyen, color: "text-[#43AB8A]" },
        ],
        chartData: Object.entries(marchandise.marchandiseParMois).map(([month, value]) => ({ month, value })),
        chartTitle: "📊 Marchandises par mois",
        chartType: "line",
      };
    }

    default:
      return { cards: [], chartData: [], chartTitle: "", chartType: "bar" };
  }
};

// ----- Composant principal Tableau de bord -----
const RapportAnalyse = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;
  const [activeTab, setActiveTab] = useState("marchandises");
  const [data, setData] = useState(null);
  const [currency, setCurrency] = useState("FCFA");
  

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/accounts/currency/", { withCredentials: true })
      .then((res) => {
        setCurrency(res.data.currency);
      })
      .catch((err) => {
        console.error(err);
      });
    fetch(`http://localhost:8000/api/gestion-stock/rapport/?entreprise=${entreprise_id}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Erreur API :", err));
  }, []);

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        ⏳ Chargement des données...
      </div>
    );
  }

  const stats = getStatsForTab(activeTab, data, currency);

  return (
    <div className="p-6 bg-gray-50 rounded-t-2xl min-h-screen">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BiBarChart className="text-[#43AB8A]" /> Analyse des données
      </h1>

      {/* Onglets */}
      <div className="flex gap-4 mb-6">
        {["marchandises", "entrees", "sorties"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === tab ? "bg-[#43AB8A] text-white" : "bg-white text-gray-700 shadow"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.cards.map((card, index) => (
          <StatCard
            key={index}
            icon={card.icon}
            label={card.label}
            value={card.value}
            color={card.color}
          />
        ))}
      </div>

      {/* Graphique */}
      <motion.div whileHover={{ scale: 1.01 }} className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">{stats.chartTitle}</h2>
        <ResponsiveContainer width="100%" height={400}>
          {stats.chartType === "bar" ? (
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(val) => [`${val}`, "Nombre"]} />
              <Bar dataKey="value" fill="#43AB8A" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(val) => [`${val}`, "Nombre"]} />
              <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default RapportAnalyse;
