import React, { useState } from "react";

const Inventaire = () => {
  const seuilAlerte = 5;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("designation");
  const [sortOrder, setSortOrder] = useState("asc");

  const stocks = [
    {
      reference: "ING-001",
      designation: "Tomates fraîches",
      categorie: "Légumes",
      unite: "Kg",
      seuilAlerte: 5,
      stockInitial: 10,
      entree: 15,
      sortie: 20,
      cump: 500,
    },
    {
      reference: "ING-002",
      designation: "Poulet entier",
      categorie: "Viande",
      unite: "Pièce",
      seuilAlerte: 3,
      stockInitial: 5,
      entree: 8,
      sortie: 6,
      cump: 3000,
    },
    {
      reference: "BOIS-001",
      designation: "Jus d'hibiscus",
      categorie: "Boisson",
      unite: "Litre",
      seuilAlerte: 10,
      stockInitial: 12,
      entree: 5,
      sortie: 10,
      cump: 700,
    },
    {
      reference: "PLAT-001",
      designation: "Pizza viande",
      categorie: "Plat préparé",
      unite: "Pièce",
      seuilAlerte: 4,
      stockInitial: 4,
      entree: 10,
      sortie: 12,
      cump: 2500,
    },
  ];

  const toggleSort = (field) => {
    setSortField(field);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredStocks = stocks
    .filter(
      (item) =>
        item.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categorie.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Inventaire</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-between">
        <input
          type="text"
          placeholder="🔍 Rechercher désignation ou catégorie"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded flex-grow dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          onClick={() => alert("Fonction Export PDF à implémenter")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          📄 Export PDF
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left">
              {[
                ["reference", "Référence"],
                ["designation", "Désignation"],
                ["categorie", "Catégorie"],
                ["unite", "Unité"],
                ["seuilAlerte", "Seuil"],
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
                  className="p-2 cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort(key)}
                >
                  {label} {sortField === key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((item, idx) => {
                const stockFinal =
                  (item.stockInitial ?? 0) + (item.entree ?? 0) - (item.sortie ?? 0);
                const isLow = stockFinal <= (item.seuilAlerte ?? seuilAlerte);
                const valeur = (stockFinal * (item.cump ?? 0)) || 0;

                return (
                  <tr
                    key={idx}
                    className={`border-t dark:border-gray-700 ${isLow ? "bg-red-50 dark:bg-red-900" : ""}`}
                  >
                    <td className="p-2">{item.reference}</td>
                    <td className="p-2">{item.designation}</td>
                    <td className="p-2">{item.categorie}</td>
                    <td className="p-2">{item.unite}</td>
                    <td className="p-2">{item.seuilAlerte}</td>
                    <td className="p-2">{item.stockInitial}</td>
                    <td className="p-2">{item.entree}</td>
                    <td className="p-2">{item.sortie}</td>
                    <td className="p-2">{stockFinal}</td>
                    <td className="p-2">{(item.cump ?? 0).toLocaleString()} FCFA</td>
                    <td className="p-2">{valeur.toLocaleString()} FCFA</td>
                    <td className="p-2">
                      {isLow ? (
                        <span className="text-red-600 font-semibold">⚠️ Faible</span>
                      ) : (
                        <span className="text-green-600 font-semibold">✔ Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Aucun article trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventaire;
