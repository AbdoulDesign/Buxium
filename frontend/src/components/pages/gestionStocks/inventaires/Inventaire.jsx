// src/components/Inventaire.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";

const API_BASE = "http://localhost:8000/api/gestion-stock"; // adapte si besoin

const Inventaire = ({ seuilAlerte = 10, itemsPerPage = 10 }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("designation");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState(""); // "normal" | "faible" | ""
  const [categoryFilter, setCategoryFilter] = useState("");
  const [exportType, setExportType] = useState("pdf");
  const [currency, setCurrency] = useState("FCFA");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);

  // endpoints
  const MARCHANDISES_URL = `${API_BASE}/marchandises/?entreprise=${entreprise_id}`;
  const ENTREES_URL = `${API_BASE}/entrees/?entreprise=${entreprise_id}`;
  const SORTIES_URL = `${API_BASE}/sorties/?entreprise=${entreprise_id}`;

  // fetch data and compute stocks
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/accounts/currency/", { withCredentials: true })
      .then((res) => {
        setCurrency(res.data.currency);
      })
      .catch((err) => {
        console.error(err);
      });
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [marchRes, entreesRes, sortiesRes] = await Promise.all([
          axios.get(MARCHANDISES_URL),
          axios.get(ENTREES_URL),
          axios.get(SORTIES_URL),
        ]);

        const marchandises = marchRes.data || [];
        const entrees = entreesRes.data || [];
        const sorties = sortiesRes.data || [];

        // helper to get id from entry's marchandise (handles object or id)
        const getMid = (m) => (m && typeof m === "object" ? m.id : m);

        // compute stocks
        const stocksWithCalcul = marchandises.map((march) => {
          const mid = march.id;
          const totalEntree = entrees
            .filter((e) => getMid(e.marchandise) === mid)
            .reduce((sum, e) => sum + Number(e.quantite || 0), 0);

          const totalSortie = sorties
            .filter((s) => getMid(s.marchandise) === mid)
            .reduce((sum, s) => sum + Number(s.quantite || 0), 0);

          const stockInitial = Number(march.stock ?? 0);
          const stockFinal = stockInitial + totalEntree - totalSortie;

          // CUMP (simplifié ici : prix produit si disponible)
          const cump = march.prix_achat ? parseFloat(march.prix_achat) : 0;
          const valeur = stockFinal * cump;

          return {
            id: march.id,
            reference: march.reference ?? "",
            designation: march.designation ?? "",
            categorie: march.categorie?.nom ?? march.categorie_nom ?? "",
            unite: march.unite ?? "",
            seuil: Number(march.seuil ?? march.seuil ?? 0),
            stockInitial,
            entree: totalEntree,
            sortie: totalSortie,
            stockFinal,
            cump,
            valeur,
            image: march.image ?? null,
          };
        });

        if (mounted) {
          setStocks(stocksWithCalcul);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        if (mounted) setError("Erreur lors du chargement des données.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [MARCHANDISES_URL, ENTREES_URL, SORTIES_URL]);

  // categories list for filter
  const categories = useMemo(
    () =>
      Array.from(
        new Set(stocks.map((s) => (s.categorie ? s.categorie : "")).filter(Boolean))
      ).sort(),
    [stocks]
  );

  // filtered + sorted
  const sortedData = useMemo(() => {
    const filtered = stocks.filter((item) => {
      // status (faible/normal) based on seuilAlerte fallback
      const seuilEffective = item.seuil ?? seuilAlerte;
      const status = item.stockFinal <= seuilEffective ? "faible" : "normal";

      // search match
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        (String(item.designation || "").toLowerCase().includes(q) ||
          String(item.reference || "").toLowerCase().includes(q) ||
          String(item.categorie || "").toLowerCase().includes(q));

      const matchesStatus = statusFilter ? status === statusFilter : true;
      const matchesCategory = categoryFilter ? item.categorie === categoryFilter : true;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // sorting
    const arr = [...filtered];
    arr.sort((a, b) => {
      const getVal = (o, key) => {
        if (key === "valeur" || key === "cump" || key === "stockFinal" || key === "entree" || key === "sortie" || key === "stockInitial" || key === "seuil")
          return Number(o[key] ?? 0);
        return String(o[key] ?? "").toLowerCase();
      };

      const A = getVal(a, sortField);
      const B = getVal(b, sortField);

      if (typeof A === "number" && typeof B === "number") {
        return sortOrder === "asc" ? A - B : B - A;
      }
      return sortOrder === "asc" ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A));
    });

    return arr;
  }, [stocks, searchTerm, statusFilter, categoryFilter, sortField, sortOrder, seuilAlerte]);

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // export handler
  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/inventaire/export/`, {
        params: { type: exportType },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const ext = exportType === "excel" ? "xlsx" : exportType;
      link.setAttribute("download", `inventaire.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur lors de l'export :", err);
      alert("Impossible d'exporter le fichier !");
    }
  };

  // toggle sorting helper
  const toggleSort = (field) => {
    if (field === sortField) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const formatNumber = (n) => Number(n || 0).toLocaleString("fr-FR");

  // UI states
  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">
        ⏳ Chargement de l'inventaire…
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        ❌ {error}
      </div>
    );

  return (
    <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6">📋 Inventaire</h2>

        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            placeholder="🔍 Rechercher désignation, référence ou catégorie"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-300"
          />

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded-lg"
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded-lg"
          >
            <option value="">Tous statuts</option>
            <option value="normal">✔ Normal</option>
            <option value="faible">⚠ Faible</option>
          </select>

          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl shadow"
            title="Exporter"
          >
            Exporter
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-[#43AB8A] text-white sticky top-0">
            <tr>
              {[
                ["reference", "Réf."],
                ["designation", "Désignation"],
                ["categorie", "Catégorie"],
                ["unite", "Unité"],
                ["seuil", "Seuil"],
                ["stockInitial", "Stock Init."],
                ["entree", "Entrées"],
                ["sortie", "Sorties"],
                ["stockFinal", "Stock Final"],
                ["cump", "CUMP"],
                ["valeur", "Valeur"],
                ["statut", "Statut"],
              ].map(([key, label]) => (
                <th
                  key={key}
                  className="p-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort(key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{label}</span>
                    {sortField === key && (
                      <span className="text-xs">{sortOrder === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginated.length > 0 ? (
              paginated.map((item, idx) => {
                const isLow = item.stockFinal <= (item.seuil ?? seuilAlerte);
                return (
                  <tr
                    key={item.id ?? idx}
                    className={`border-t hover:bg-gray-50 ${isLow ? "bg-red-50" : ""}`}
                  >
                    <td className="p-3 font-medium">{item.reference}</td>
                    <td className="p-3">{item.designation}</td>
                    <td className="p-3">{item.categorie}</td>
                    <td className="p-3">{item.unite}</td>
                    <td className="p-3 text-center">{item.seuil}</td>
                    <td className="p-3 text-center">{item.stockInitial}</td>
                    <td className="p-3 text-center">{item.entree}</td>
                    <td className="p-3 text-center">{item.sortie}</td>
                    <td className="p-3 text-center font-semibold">{item.stockFinal}</td>
                    <td className="p-3 text-right">{formatNumber(item.cump)} {currency}</td>
                    <td className="p-3 text-right">{formatNumber(item.valeur)} {currency}</td>
                    <td className="p-3 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                          <FaExclamationTriangle /> Faible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                          <FaCheck /> Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={12} className="p-6 text-center text-gray-500">
                  Aucun article trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination UI */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          <span>Page {currentPage} sur {totalPages} ({sortedData.length} inventaires)</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Préc.
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded-lg ${currentPage === i + 1 ? "bg-[#43AB8A] text-white" : ""}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Suiv.
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventaire;
