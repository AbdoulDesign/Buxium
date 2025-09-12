import React from "react";

const HistoriqueTransactions = () => {
  const transactions = [
    { date: "20/07/2025", fournisseur: "Fournisseur A", montant: "150,000 FCFA" },
    { date: "18/07/2025", fournisseur: "Fournisseur B", montant: "80,000 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Historique des Transactions</h2>
      <ul>
        {transactions.map((t, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {t.date} - {t.fournisseur} - {t.montant}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoriqueTransactions;
