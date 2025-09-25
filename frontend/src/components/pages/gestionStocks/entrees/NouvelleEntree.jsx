import React, { useEffect, useState } from "react";
import api from "../../../Api"; // <-- API centralisée

const NouvelleEntree = ({ onClose, onAdded, entree, marchandisesById, boutique_id}) => {
  const [marchandises, setMarchandises] = useState([]);
  const [form, setForm] = useState({
    marchandise_id: entree?.marchandise?.id || entree?.marchandise || "",
    quantite: entree?.quantite || "",
    boutique: boutique_id,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Charger toutes les marchandises
  useEffect(() => {
    let mounted = true;
    const fetchMarchandises = async () => {
      try {
        const res = await api.get("/gestion_stock/marchandises/");
        if (mounted) setMarchandises(res.data || []);
      } catch (e) {
        console.error("Erreur chargement marchandises:", e);
        if (mounted) setErr("Impossible de charger les marchandises ❌");
      }
    };
    fetchMarchandises();
    return () => (mounted = false);
  }, []);

  const selected = marchandises.find(
    (m) => String(m.id) === String(form.marchandise_id)
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setErr("");

    try {
      const payload = {
        marchandise_id: Number(form.marchandise_id),
        quantite: Number(form.quantite),
        boutique: boutique_id,
      };

      let res;
      if (entree?.id) {
        // 🔹 Mode édition (PUT)
        res = await api.put(`/gestion_stock/entrees/${entree.id}/`, payload);
      } else {
        // 🔹 Mode ajout (POST)
        res = await api.post("/gestion_stock/entrees/", payload);
      }

      onAdded?.(res.data);
      onClose?.();
    } catch (error) {
      console.error(error);
      setErr("Erreur lors de l’enregistrement ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-gray-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
        <h2 className="text-xl font-bold mb-4 text-center">
          {entree ? "✏️ Modifier l’entrée" : "➕ Ajouter une entrée"}
        </h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✖
        </button>

        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Marchandise</label>
            <select
              name="marchandise_id"
              value={form.marchandise_id}
              onChange={onChange}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="">-- Sélectionner --</option>
              {marchandises.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.reference
                    ? `${m.reference} — ${m.name}`
                    : m.name}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="rounded-lg border p-3 text-sm bg-gray-50">
              <div className="font-semibold">{selected.name}</div>
              <div>Catégorie : {selected?.categorie?.label || "—"}</div>
              <div>Unité : {selected.unite}</div>
              <div>Prix d'achat : {Number(selected.prix_achat || 0).toLocaleString()} FCFA</div>
              {selected.image && (
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="mt-2 w-20 h-20 object-cover rounded"
                />
              )}
            </div>
          )}

          <div>
            <label className="block mb-1 font-medium">Quantité</label>
            <input
              type="number"
              min="1"
              name="quantite"
              value={form.quantite}
              onChange={onChange}
              className="w-full border rounded-lg p-2"
              placeholder="Ex: 10"
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading
                ? "Enregistrement..."
                : entree
                ? "Mettre à jour"
                : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NouvelleEntree;
