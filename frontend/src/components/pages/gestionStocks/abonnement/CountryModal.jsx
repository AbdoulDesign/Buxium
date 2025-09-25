import React, { useState } from "react";
import { FaCreditCard, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../../../Api";

const CountryModal = ({ country, plan, boutiqueId, onClose }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!country) return null;

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setPhoneNumber("");
    setResult(null);
  };

  const getAmountString = () => {
    if (typeof plan?.rawPrice === "number") return String(plan.rawPrice);
    if (plan?.price) return String(plan.price);
    if (typeof plan?.prix === "string")
      return plan.prix.replace(/\s*FCFA$/i, "").trim();
    return "";
  };

  const normalizeProviderCode = (provider) => {
    return (
      provider?.provider ||
      provider?.code ||
      provider?.name ||
      provider?.displayName ||
      provider?.display_name ||
      ""
    );
  };

  const handlePayment = async () => {
    setResult(null);

    if (!selectedProvider) {
      setResult({ success: false, message: "Veuillez choisir un opérateur." });
      return;
    }

    const normalizedPhone = (phoneNumber || "").replace(/\D/g, "");
    if (!normalizedPhone || normalizedPhone.length < 6) {
      setResult({ success: false, message: "Numéro invalide (trop court)." });
      return;
    }

    const amount = getAmountString();
    if (!amount) {
      setResult({ success: false, message: "Montant du plan introuvable." });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        boutique_id: boutiqueId,
        plan_id: plan?.id,
        amount: String(amount),
        currency: selectedProvider?.currencies?.[0]?.currency,
        country: country.country,
        payer: {
          type: "MMO",
          accountDetails: {
            phoneNumber: `${country.prefix}${normalizedPhone}`,
            provider: normalizeProviderCode(selectedProvider),
          },
        },
      };

      const res = await api.post(`/pawapay/`, payload);

      const statusReturned =
        res?.data?.status ||
        res?.data?.server_response?.status ||
        null;

      if (statusReturned && statusReturned.toUpperCase() === "COMPLETED") {
        setResult({
          success: true,
          message: "Paiement effectué avec succès ✅",
        });
      } else if (statusReturned && statusReturned.toUpperCase() === "PENDING") {
        setResult({
          success: true,
          message: "Paiement en attente... Vous serez notifié après confirmation.",
        });
      } else {
        setResult({
          success: false,
          message: `Paiement refusé !`,
        });
      }
    } catch (err) {
      const message = err?.response?.data
        ? JSON.stringify(err.response.data)
        : err?.message || "Erreur réseau ou serveur";
      setResult({ success: false, message: `Erreur : ${message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
          >
            ✖
          </button>

          {/* Header country */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={country.flag}
              alt={country.displayName?.fr || country.country}
              className="w-10 h-8 object-cover rounded"
            />
            <h3 className="text-xl font-bold">
              {country.displayName?.fr || country.country}
            </h3>
          </div>

          {/* Operators list horizontal */}
          <h4 className="text-lg font-semibold mb-3">
            Choisissez un opérateur :
          </h4>
          <div className="flex gap-4 overflow-x-auto pb-3">
            {country.providers?.map((provider, idx) => {
              const providerKey =
                provider.provider ||
                provider.code ||
                provider.name ||
                provider.displayName ||
                idx;
              const isSelected =
                normalizeProviderCode(selectedProvider) ===
                normalizeProviderCode(provider);
              return (
                <div
                  key={providerKey}
                  onClick={() => handleProviderSelect(provider)}
                  className={`cursor-pointer flex flex-col items-center p-4 border rounded-xl min-w-[120px] transition hover:shadow-md ${
                    isSelected
                      ? "border-[#43AB8A] bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={provider.logo}
                    alt={provider.displayName || provider.name}
                    className="w-12 h-12 mb-2 object-contain"
                  />
                  <p className="text-sm font-medium text-center">
                    {provider.displayName || provider.name}
                  </p>
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => handleProviderSelect(provider)}
                    className="mt-2 accent-[#43AB8A]"
                  />
                </div>
              );
            }) || (
              <div className="text-sm text-gray-500">
                Aucun opérateur disponible
              </div>
            )}
          </div>

          {/* Phone input */}
          {selectedProvider && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entrez votre numéro :
              </label>
              <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-3 bg-gray-100 border-r">
                  <img
                    src={selectedProvider.logo}
                    alt={selectedProvider.displayName || selectedProvider.name}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="font-medium text-gray-700">
                    +{country.prefix}
                  </span>
                </div>
                <input
                  inputMode="tel"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: 70123456"
                  className="flex-1 px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Pay button */}
          {selectedProvider && (
            <div className="mt-6">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold bg-[#43AB8A] hover:bg-green-600 text-white transition disabled:opacity-60"
              >
                <FaCreditCard />
                {loading ? "Traitement..." : `Payer ${getAmountString()} FCFA`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result modal */}
      {result && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 mx-4">
            <div className="flex items-center gap-4">
              {result.success ? (
                <FaCheckCircle className="text-green-600 text-3xl" />
              ) : (
                <FaTimesCircle className="text-red-600 text-3xl" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">
                  {result.success ? "Succès" : "Échec"}
                </h3>
                <p className="text-sm text-gray-700 mt-1 break-words">
                  {result.message}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (result.success) {
                    setResult(null);
                    onClose && onClose();
                  } else {
                    setResult(null);
                  }
                }}
                className="px-4 py-2 rounded-md bg-[#43AB8A] text-white hover:bg-green-600"
              >
                {result.success ? "OK" : "Réessayer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CountryModal;
