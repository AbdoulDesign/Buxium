import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../components/Api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  AlertTriangle,
} from "lucide-react";

// ---- Composant carte statistique ----
const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white shadow-lg rounded-2xl py-4 px-3 flex items-center gap-3 sm:gap-4"
  >
    <div className={`p-2 sm:p-3 rounded-xl ${color} bg-opacity-20`}>
      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
    </div>
    <div>
      <p className="text-xs sm:text-sm text-gray-500">{label}</p>
      <h2 className={`text-sm sm:text-md font-bold ${color}`}>{value}</h2>
    </div>
  </motion.div>
);

const TableauDeBord = () => {
  const [stats, setStats] = useState({
    revenu_du_jour: 0,
    depense_du_jour: 0,
    entrees_du_jour: 0,
    sorties_du_jour: 0,
    stock_alerte: 0,
  });
  const [dataEntrees, setDataEntrees] = useState([]);
  const [dataSorties, setDataSorties] = useState([]);
  const [currency, setCurrency] = useState("FCFA");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Devise
        const currencyRes = await api.get("accounts/currency/", {
          withCredentials: true,
        });
        setCurrency(currencyRes.data.currency);

        // Dashboard (stats + graphiques)
        const res = await api.get("gestion_stock/dashboard", {
          withCredentials: true,
        });
        const response = res.data;

        // Stats
        setStats(response.stats);

        // Graphique Entrées
        const entrees = Object.entries(response.graphique_entrees).map(
          ([day, value]) => ({ day, value })
        );
        setDataEntrees(entrees);

        // Graphique Sorties
        const sorties = Object.entries(response.graphique_sorties).map(
          ([day, value]) => ({ day, value })
        );
        setDataSorties(sorties);
      } catch (err) {
        console.error("Erreur lors du chargement du dashboard:", err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 rounded-t-2xl">
      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          icon={DollarSign}
          label="Revenu du jour"
          value={`${stats.revenu_du_jour} ${currency}`}
          color="text-[#43AB8A]"
        />
        <StatCard
          icon={ArrowDownCircle}
          label="Dépense du jour"
          value={`${stats.depense_du_jour} ${currency}`}
          color="text-red-500"
        />
        <StatCard
          icon={ArrowUpCircle}
          label="Entrées du jour"
          value={stats.entrees_du_jour}
          color="text-blue-500"
        />
        <StatCard
          icon={Package}
          label="Sorties du jour"
          value={stats.sorties_du_jour}
          color="text-purple-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Alertes stock"
          value={`${stats.stock_alerte} articles`}
          color="text-orange-500"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Graphique Entrées */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white shadow-lg rounded-2xl p-4 sm:p-6"
        >
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            📦 Entrées des 7 derniers jours
          </h2>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataEntrees}>
                <XAxis dataKey="day" interval={0} angle={-30} textAnchor="end" />
                <YAxis />
                <Tooltip formatter={(val) => [`${val}`, "Nombre"]} />
                <Bar dataKey="value" fill="#43AB8A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Graphique Sorties */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white shadow-lg rounded-2xl p-4 sm:p-6"
        >
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            📤 Sorties des 7 derniers jours
          </h2>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataSorties}>
                <XAxis dataKey="day" interval={0} angle={-30} textAnchor="end" />
                <YAxis />
                <Tooltip formatter={(val) => [`${val}`, "Nombre"]} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TableauDeBord;
