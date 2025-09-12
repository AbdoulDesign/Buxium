import React, { useState, useRef } from "react";
import { menu } from "../commandes/data";
import { Plus, Trash2, Printer } from "lucide-react";
import Plat from "../../../../assets/Plat_africain.jpeg";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const NewOrder = () => {
  const [orderType, setOrderType] = useState("sur place");
  const [items, setItems] = useState([]);
  const [clientName, setClientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("Payé");

  const printRef = useRef();

  const handleAddItem = (item) => {
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      setItems(items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { ...item, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (id, quantity) => {
    setItems(items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePrint = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("commande.pdf");
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SECTION GAUCHE */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-2xl font-bold text-green-700">🧾 Nouvelle Commande</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block mb-1 text-sm">Type de commande</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full border rounded px-3 py-2 dark:bg-gray-700"
              >
                <option>sur place</option>
                <option>à emporter</option>
                <option>livraison</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1 text-sm">Moyen de paiement</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border rounded px-3 py-2 dark:bg-gray-700"
              >
                <option value="cash">Espèces</option>
                <option value="om">Orange Money</option>
                <option value="mc">Mobile Cash</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1 text-sm">Statut</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full border rounded px-3 py-2 dark:bg-gray-700"
              >
                <option>Payé</option>
                <option>Non payé</option>
              </select>
            </div>
          </div>

          {orderType === "livraison" && (
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nom du client"
              className="w-full mt-4 border rounded px-3 py-2 dark:bg-gray-700"
            />
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {menu.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddItem(item)}
                className="cursor-pointer bg-green-50 hover:bg-green-100 dark:bg-green-900 p-4 rounded-xl border dark:border-green-700 text-center"
              >
                <img src={Plat} alt={item.name} className="h-20 w-20 mx-auto object-cover rounded mb-2" />
                <p className="font-medium text-green-800 dark:text-green-300">{item.name}</p>
                <p className="text-sm font-semibold text-green-600">{item.price.toLocaleString()} FCFA</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION DROITE */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg" ref={printRef}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-700">🧺 Mon Panier</h3>
            {items.length > 0 && (
              <button onClick={handlePrint} title="Imprimer" className="text-green-700 hover:text-green-900">
                <Printer size={20} />
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun plat sélectionné.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-100">
                  <th className="text-left p-2">Plat</th>
                  <th>Qté</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b dark:border-gray-700">
                    <td className="p-2">{item.name}</td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="w-14 px-2 py-1 border rounded dark:bg-gray-700"
                      />
                    </td>
                    <td>{(item.price * item.quantity).toLocaleString()} FCFA</td>
                    <td>
                      <button onClick={() => handleRemoveItem(item.id)} className="text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {items.length > 0 && (
            <>
              <div className="mt-6 text-right font-bold text-green-700 text-lg">
                Total : {total.toLocaleString()} FCFA
              </div>
              <button
                onClick={() => {
                  console.log("Commande :", {
                    clientName,
                    orderType,
                    paymentMethod,
                    paymentStatus,
                    items,
                    total,
                  });
                  alert("Commande enregistrée !");
                  setItems([]);
                  setClientName("");
                }}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                ✅ Enregistrer la commande
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
