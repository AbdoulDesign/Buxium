import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const ModalSortie = ({ show, onClose, onSave, sortie, marchandises, boutique_id }) => {
  const [form, setForm] = useState({
    quantite: "",
    marchandise_id: "",
    boutique: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(""); // 👉 pour stocker les erreurs API

  useEffect(() => {
    if (sortie) {
      setForm({
        quantite: sortie.quantite ?? "",
        marchandise_id: sortie.marchandise?.id ?? "",
        boutique: boutique_id,
      });
    } else {
      setForm({ quantite: "", marchandise_id: "" });
    }
    setError(""); // reset erreur à l’ouverture
  }, [sortie, show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(""); // reset erreur avant envoi

    try {
      // Payload attendu par ton backend
      const payload = {
        quantite: Number(form.quantite),
        marchandise_id: form.marchandise_id,
        boutique: boutique_id,
      };

      await onSave(payload);

      // Si pas d'erreur → fermer la modal
      onClose();
    } catch (err) {
      console.error("Erreur lors de save dans modal:", err);

      // 👉 récupérer le message précis de l'API
      if (err.response && err.response.data) {
        setError(err.response.data.quantite || "Choisissez une marchandise avant d'enregistrer !");
      } else {
        setError("Erreur lors de l'enregistrement.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold mb-4">
          {sortie ? "Modifier sortie" : "Nouvelle sortie"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm text-gray-600">Marchandise</label>
          <select
            name="marchandise_id"
            value={form.marchandise_id}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">-- Choisir une marchandise --</option>
            {marchandises.map((m) => (
              <option key={m.id} value={m.id}>
                {m.reference ? `${m.reference} — ${m.name}` : m.name}
              </option>
            ))}
          </select>

          <label className="text-sm text-gray-600">Quantité</label>
          <input
            type="number"
            name="quantite"
            min="1"
            value={form.quantite}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />

          {/* 👉 Zone d'affichage de l'erreur */}
          {error && (
            <div className="bg-red-100 text-red-700 px-3 py-2 text-center rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#43AB8A] hover:bg-[#589884] text-white py-2 rounded-lg"
            >
              {saving
                ? "Enregistrement..."
                : sortie
                  ? "Mettre à jour"
                  : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalSortie;
