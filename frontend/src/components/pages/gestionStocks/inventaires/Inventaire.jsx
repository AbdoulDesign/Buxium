import React, { useEffect, useMemo, useState } from "react";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import api from "../../../Api"; // API centralisée

const Inventaire = ({ seuilAlerte = 10, itemsPerPage = 10 }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState(""); // "normal" | "faible" | ""
  const [categoryFilter, setCategoryFilter] = useState("");
  const [exportType, setExportType] = useState("pdf");
  const [currency, setCurrency] = useState("FCFA");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Récupération currency
        const currencyRes = await api.get("/accounts/currency/", { withCredentials: true });
        if (mounted) setCurrency(currencyRes.data.currency);

        // Récupérer marchandises, entrées et sorties
        const [marchRes, entreesRes, sortiesRes] = await Promise.all([
          api.get("/gestion_stock/marchandises/"),
          api.get("/gestion_stock/entrees/"),
          api.get("/gestion_stock/sorties/"),
        ]);

        const marchandises = marchRes.data || [];
        const entrees = entreesRes.data || [];
        const sorties = sortiesRes.data || [];

        // Calcul stocks
        const getMid = (m) => (m && typeof m === "object" ? m.id : m);

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

          const cump = march.prix_achat ? parseFloat(march.prix_achat) : 0;
          const valeur = stockFinal * cump;

          return {
            id: march.id,
            reference: march.reference ?? "",
            name: march.name ?? "",
            categorie: march.categorie?.label ?? march.categorie_nom ?? "",
            unite: march.unite ?? "",
            seuil: Number(march.seuil ?? seuilAlerte),
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
    return () => (mounted = false);
  }, [seuilAlerte]);

  // Categories
  const categories = useMemo(
    () =>
      Array.from(new Set(stocks.map((s) => s.categorie).filter(Boolean))).sort(),
    [stocks]
  );

  // Filtrage + tri
  const sortedData = useMemo(() => {
    const filtered = stocks.filter((item) => {
      const status = item.stockFinal <= item.seuil ? "faible" : "normal";

      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.reference.toLowerCase().includes(q) ||
        item.categorie.toLowerCase().includes(q);

      const matchesStatus = statusFilter ? status === statusFilter : true;
      const matchesCategory = categoryFilter ? item.categorie === categoryFilter : true;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    const arr = [...filtered];
    arr.sort((a, b) => {
      const getVal = (o, key) =>
        ["valeur", "cump", "stockFinal", "entree", "sortie", "stockInitial", "seuil"].includes(key)
          ? Number(o[key] ?? 0)
          : String(o[key] ?? "").toLowerCase();

      const A = getVal(a, sortField);
      const B = getVal(b, sortField);

      if (typeof A === "number" && typeof B === "number") {
        return sortOrder === "asc" ? A - B : B - A;
      }
      return sortOrder === "asc" ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A));
    });

    return arr;
  }, [stocks, searchTerm, statusFilter, categoryFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Export
  const handleExport = async () => {
    try {
      const res = await api.get("/gestion_stock/inventaire/export/", {
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
      {/* Filtres & header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">📋 Inventaire</h2>

        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="🔍 Rechercher désignation, référence ou catégorie"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-300"
          />

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded-lg w-full sm:w-auto"
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
            className="p-2 border rounded-lg w-full sm:w-auto"
          >
            <option value="">Tous statuts</option>
            <option value="normal">✔ Normal</option>
            <option value="faible">⚠ Faible</option>
          </select>

          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="p-2 border rounded-lg w-full sm:w-auto"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl shadow w-full sm:w-auto"
            title="Exporter"
          >
            Exporter
          </button>
        </div>
      </div>

      {/* Vue tableau (desktop) */}
      <div className="hidden md:block overflow-auto rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-[#43AB8A] text-white sticky top-0">
            <tr>
              {[
                ["reference", "Réf."],
                ["name", "Désignation"],
                ["categorie", "Catégorie"],
                ["unite", "Unité"],
                ["seuil", "Seuil"],
                ["stockInitial", "Stock Initial"],
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
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.categorie}</td>
                    <td className="p-3">{item.unite}</td>
                    <td className="p-3 text-center">{item.seuil}</td>
                    <td className="p-3 text-center">{item.stockInitial}</td>
                    <td className="p-3 text-center">{item.entree}</td>
                    <td className="p-3 text-center">{item.sortie}</td>
                    <td className="p-3 text-center font-semibold">{item.stockFinal}</td>
                    <td className="p-3 text-right">
                      {formatNumber(item.cump)} {currency}
                    </td>
                    <td className="p-3 text-right">
                      {formatNumber(item.valeur)} {currency}
                    </td>
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

      {/* Vue cartes (mobile) */}
      <div className="md:hidden space-y-4">
        {paginated.length > 0 ? (
          paginated.map((item, idx) => {
            const isLow = item.stockFinal <= (item.seuil ?? seuilAlerte);
            return (
              <div
                key={item.id ?? idx}
                className={`p-4 rounded-xl shadow-sm ${
                  isLow ? "bg-red-50" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <span
                    className={`text-sm font-semibold ${
                      isLow ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isLow ? "⚠ Faible" : "✔ Normal"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Réf: {item.reference}</p>
                <p className="text-sm text-gray-600">Catégorie: {item.categorie}</p>
                <p className="text-sm text-gray-600">Unité: {item.unite}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <span>Seuil: <strong>{item.seuil}</strong></span>
                  <span>Stock initial: <strong>{item.stockInitial}</strong></span>
                  <span>Entrées: <strong>{item.entree}</strong></span>
                  <span>Sorties: <strong>{item.sortie}</strong></span>
                  <span>Stock: <strong>{item.stockFinal}</strong></span>
                  <span>CUMP: <strong>{formatNumber(item.cump)} {currency}</strong></span>
                  <span className="col-span-2">
                    Valeur: <strong>{formatNumber(item.valeur)} {currency}</strong>
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-6">Aucun article trouvé.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <div className="text-sm text-gray-600">
          <span>
            Page {currentPage} sur {totalPages} ({sortedData.length} inventaires)
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
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
              className={`px-3 py-1 border rounded-lg ${
                currentPage === i + 1 ? "bg-[#43AB8A] text-white" : ""
              }`}
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
    </div>  );
};

export default Inventaire;
