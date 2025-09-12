import React, { useState } from "react";
import { sampleOrders } from "../commandes/orders";
import { CheckCircle, AlertCircle, Printer } from "lucide-react";

const OrderList = () => {
  const [statusFilter, setStatusFilter] = useState("tous");

  const filteredOrders =
    statusFilter === "tous"
      ? sampleOrders
      : sampleOrders.filter((order) =>
          statusFilter === "payé" ? order.paid : !order.paid
        );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          📦 Liste des Commandes
        </h2>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg print:hidden"
        >
          <Printer size={18} /> Imprimer
        </button>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <label className="text-gray-700 dark:text-gray-300 font-medium">
          Filtrer par statut :
        </label>
        <select
          className="p-2 rounded-md border dark:bg-gray-800 dark:border-gray-600"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="tous">Tous</option>
          <option value="payé">Payé</option>
          <option value="non payé">Non payé</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500">Aucune commande trouvée.</p>
      ) : (
        <div className="overflow-auto rounded-lg shadow border dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th>Client</th>
                <th>Type</th>
                <th>Plat</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
                <th>Paiement</th>
                <th>Moyen</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) =>
                order.items.map((item, index) => (
                  <tr key={`${order.id}-${index}`}>
                    {index === 0 && (
                      <>
                        <td rowSpan={order.items.length} className="px-4 py-2 font-semibold">{order.id}</td>
                        <td rowSpan={order.items.length}>{order.clientName}</td>
                        <td rowSpan={order.items.length}>{order.type}</td>
                      </>
                    )}
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price ? item.price.toLocaleString() + " FCFA" : "—"}</td>
                    <td>{item.price && item.quantity ? (item.price * item.quantity).toLocaleString() + " FCFA" : "—"}</td>
                    {index === 0 && (
                      <>
                        <td rowSpan={order.items.length}>
                          {order.paid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500 text-white text-xs">
                              <CheckCircle size={14} /> Payé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs">
                              <AlertCircle size={14} /> Non payé
                            </span>
                          )}
                        </td>
                        <td rowSpan={order.items.length}>
                          {order.paymentMethod}
                        </td>
                        <td rowSpan={order.items.length}>{order.date}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderList;
