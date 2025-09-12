import React, { useState } from "react";
import { Button } from "../../../ui";

export default function NouvelleTransaction({ onAdd, onClose }) {
  const [form, setForm] = useState({
    type: "revenu",
    description: "",
    categorie: "",
    montant: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm({ type: "revenu", description: "", categorie: "", montant: "" });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">Ajouter une Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border rounded p-2"
          >
            <option value="revenu">Revenu</option>
            <option value="depense">Dépense</option>
          </select>
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="text"
            placeholder="Catégorie"
            value={form.categorie}
            onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="number"
            placeholder="Montant (FCFA)"
            value={form.montant}
            onChange={(e) => setForm({ ...form, montant: e.target.value })}
            className="w-full border rounded p-2"
            required
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              className="bg-gray-300 text-black"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit" className="bg-[#43AB8A] text-white">
              Ajouter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
