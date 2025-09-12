import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, CardContent } from "../../../ui";
import NouvelleTransaction from "./NouvelleTransaction";
import { BiDollarCircle } from "react-icons/bi";
import { ArrowLeftRight } from "lucide-react";

import { ArrowDownCircle, ArrowUpCircle, LineChart, Wallet, DollarSign } from "lucide-react";

const API_BASE = "http://localhost:8000/api/gestion-stock";

export default function FinancePage() {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;
  const [transactions, setTransactions] = useState([]);
  const [finance, setFinance] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("7jours");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [currency, setCurrency] = useState("FCFA");

  // Dates pour filtre personnalisé
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const tabs = [
    { id: "7jours", label: "7 derniers jours" },
    { id: "30jours", label: "30 derniers jours" },
    { id: "toujours", label: "Toujours" },
    { id: "personnalise", label: "Personnalisé" },
  ];

  // Charger données
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/accounts/currency/", { withCredentials: true })
      .then((res) => {
        setCurrency(res.data.currency);
      })
      .catch((err) => {
        console.error(err);
      });
    fetchTransactions();
    fetchFinance();
  }, []);

  // ✅ Fonction de filtrage par période
  const filterByTab = (data, tab, filterStartDate, filterEndDate) => {
    const today = new Date();

    if (tab === "toujours") return data;

    if (tab === "personnalise" && filterStartDate && filterEndDate) {
      const start = new Date(filterStartDate);
      const end = new Date(filterEndDate);

      // ✅ Ajuster l'heure de fin au dernier milliseconde du jour
      end.setHours(23, 59, 59, 999);

      return data.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= start && itemDate <= end;
      });
    }

    let startDate;
    let endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999); // ✅ inclure toute la journée

    if (tab === "7jours") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
    } else if (tab === "30jours") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
    }

    return data.filter((item) => {
      const itemDate = new Date(item.created_at);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const fetchFinance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/finance/?entreprise=${entreprise_id}`);
      setFinance(res.data);
    } catch (error) {
      console.error("Erreur chargement finance:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/transactions/?entreprise=${entreprise_id}`);
      setTransactions(res.data);
    } catch (error) {
      console.error("Erreur chargement transactions:", error);
    }
  };

  const handleAdd = async (form) => {
    try {
      await axios.post(`${API_BASE}/transactions/`, form);
      setShowModal(false);
      fetchTransactions();
      fetchFinance();
    } catch (error) {
      console.error("Erreur ajout transaction:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/transactions/${id}/`);
      fetchTransactions();
      fetchFinance();
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    }).format(new Date(date));
  };


  // ---- Transactions filtrées (tableau) ----
  const filteredTransactions = filterByTab(
    transactions,
    activeTab,
    filterStartDate,
    filterEndDate
  );

  // ---- Pagination ----
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);


  // ---- Totaux ----
  let revenuFinance = 0;
  let depenseFinance = 0;
  let total_entree = 0;
  let total_sortie = 0;
  let revenusFiltres = 0;
  let depensesFiltres = 0;


  if (finance && finance.details) {
  const details = finance.details;

  // ---- Revenu ----
  revenusFiltres = filterByTab(
    details.transactions_revenus || [],
    activeTab,
    filterStartDate,
    filterEndDate
  )
    .filter((t) => t.is_active === true)
    .reduce((sum, t) => sum + parseFloat(t.montant || 0), 0);

  const sortiesFiltres = filterByTab(
    details.sorties || [],
    activeTab,
    filterStartDate,
    filterEndDate
  ).reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

  revenuFinance = revenusFiltres + sortiesFiltres;

  // ---- Dépense ----
  depensesFiltres = filterByTab(
    details.transactions_depenses || [],
    activeTab,
    filterStartDate,
    filterEndDate
  )
    .filter((t) => t.is_active === true)
    .reduce((sum, t) => sum + parseFloat(t.montant || 0), 0);

  const entreesFiltres = filterByTab(
    details.entrees || [],
    activeTab,
    filterStartDate,
    filterEndDate
  ).reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

  depenseFinance = depensesFiltres + entreesFiltres;

// ---- Entrées & Sorties ----
total_entree = filterByTab(
  details.entrees || [],
  activeTab,
  filterStartDate,
  filterEndDate
).reduce((sum, e) => sum + parseFloat(e.total || 0), 0);

total_sortie = filterByTab(
  details.sorties || [],
  activeTab,
  filterStartDate,
  filterEndDate
).reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

}

  // ---- Solde & Marge ----
  const soldeFinance = revenuFinance - depenseFinance;
  const marge = total_sortie - total_entree;

  return (
    <div className="p-6 bg-gray-50 rounded-t-2xl">
      {/* Titre */}
      <h1 className="text-center text-2xl font-bold mb-6 text-[#43AB8A] dark:text-[#43AB8A]">
        Christy Cosmetiques
      </h1>

      {/* Section Finances */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BiDollarCircle className="text-[#43AB8A]" size={25} />
          Finances
        </h2>
        <Button
          className="bg-[#43AB8A] hover:bg-[#518876] text-white"
          onClick={() => setShowModal(true)}
        >
          Ajouter une Transaction
        </Button>
      </div>

      {/* Onglets */}
      <div className="flex gap-4 mb-6 items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === tab.id
              ? "bg-[#43AB8A] text-white"
              : "bg-white text-gray-700 shadow"
              }`}
          >
            {tab.label}
          </button>
        ))}

        {/* ✅ inputs dates si personnalisé */}
        {activeTab === "personnalise" && (
          <div className="flex gap-2 items-center ml-4">
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="p-2 rounded-xl shadow-lg border border-gray-300"
            />
            <span>→</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="p-2 rounded-xl shadow-lg border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* ✅ Indication de l'intervalle */}
      {activeTab === "personnalise" && filterStartDate && filterEndDate && (
        <p className="text-gray-600 mb-4">
          Intervalle : <span className="font-semibold">
            {formatDate(filterStartDate)} → {formatDate(filterEndDate)}
          </span>
        </p>
      )}

      <div className="space-y-10">
        {/* Statistiques ventes & achats */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-[#43AB8A]" />
            Ventes & Achats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm hover:shadow-md transition border-l-4 border-green-500 rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">VENTES</p>
                  <h2 className="text-xl font-bold text-gray-800">{total_sortie} {currency}</h2>
                </div>
                <ArrowUpCircle className="text-green-500 w-6 h-6" />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition border-l-4 border-red-500 rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">ACHATS</p>
                  <h2 className="text-xl font-bold text-gray-800">{total_entree} {currency}</h2>
                </div>
                <ArrowDownCircle className="text-red-500 w-6 h-6" />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition border-l-4 border-[#43AB8A] rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">MARGE BRUTE</p>
                  <h2
                    className={`text-xl font-bold ${marge >= 0 ? "text-[#43AB8A]" : "text-red-600"
                      }`}
                  >
                    {marge} {currency}
                  </h2>
                </div>
                <LineChart className="text-[#43AB8A] w-6 h-6" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistiques transactions */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">💳 Transactions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm hover:shadow-md transition border-l-4 border-green-500 rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">REVENUS</p>
                  <h2 className="text-xl font-bold text-gray-800">{revenusFiltres} {currency}</h2>
                </div>
                <ArrowUpCircle className="text-green-500 w-6 h-6" />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition border-l-4 border-red-500 rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">DÉPENSES</p>
                  <h2 className="text-xl font-bold text-gray-800">{depensesFiltres} {currency}</h2>
                </div>
                <ArrowDownCircle className="text-red-500 w-6 h-6" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistiques Finance */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">💼 Finance Globale</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm hover:shadow-md transition border-l-4 border-green-500 rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">REVENUS TOTAL</p>
                  <h2 className="text-xl font-bold text-gray-800">{revenuFinance} {currency}</h2>
                </div>
                <DollarSign className="text-green-500 w-6 h-6" />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition border-l-4 border-red-500 rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">DÉPENSES TOTAL</p>
                  <h2 className="text-xl font-bold text-gray-800">{depenseFinance} {currency}</h2>
                </div>
                <Wallet className="text-red-500 w-6 h-6" />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition border-l-4 border-[#43AB8A] rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">SOLDE TOTAL</p>
                  <h2
                    className={`text-xl font-bold ${soldeFinance >= 0 ? "text-[#43AB8A]" : "text-red-600"
                      }`}
                  >
                    {soldeFinance} {currency}
                  </h2>
                </div>
                <Wallet className="text-[#43AB8A] w-6 h-6" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tableau Résumé Financier */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-4">Résumé Financier</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold">
              <th className="p-2">Date</th>
              <th className="p-2">Type</th>
              <th className="p-2">Description</th>
              <th className="p-2">Catégorie</th>
              <th className="p-2">Montant</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((t) => (
              <tr
                key={t.id}
                className="border-b text-sm hover:bg-gray-50 transition"
              >
                <td className="p-2">
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${t.type === "revenu"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {t.type}
                  </span>
                </td>
                <td className="p-2">{t.description}</td>
                <td className="p-2">{t.categorie}</td>
                <td
                  className={`p-2 font-semibold ${t.type === "revenu" ? "text-[#43AB8A]" : "text-red-600"
                    }`}
                >
                  {t.type === "revenu" ? "+ " : "- "}
                  {t.montant} {currency}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600">
            Page {currentPage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Précédent
            </Button>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Nouvelle Transaction */}
      {showModal && (
        <NouvelleTransaction
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
