import React from "react";
import { FaWhatsapp, FaEnvelope, FaHeadset } from "react-icons/fa";

const PageAide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-green-50 p-6">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Besoin d'aide ?</h1>
        <p className="text-gray-600 text-lg">
          Notre équipe est là pour vous accompagner. Choisissez votre méthode de contact préférée.
        </p>
      </header>

      {/* Section Contacts */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* WhatsApp */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform hover:scale-105 transition">
          <FaWhatsapp className="text-green-500 text-5xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
          <p className="text-gray-600 mb-4">Contactez-nous directement sur WhatsApp pour une réponse rapide.</p>
          <a
            href="https://wa.me/22670000000"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold transition"
          >
            Envoyer un message
          </a>
        </div>

        {/* Email */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform hover:scale-105 transition">
          <FaEnvelope className="text-blue-500 text-5xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Email</h3>
          <p className="text-gray-600 mb-4">Envoyez-nous un email et nous répondrons dans les plus brefs délais.</p>
          <a
            href="mailto:contact@wendlatech.com"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold transition"
          >
            Envoyer un email
          </a>
        </div>

        {/* Support */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform hover:scale-105 transition">
          <FaHeadset className="text-purple-500 text-5xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Assistance</h3>
          <p className="text-gray-600 mb-4">Posez vos questions ou signalez un problème directement à notre support.</p>
          <a
            href="mailto:support@wendlatech.com"
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full font-semibold transition"
          >
            Contacter le support
          </a>
        </div>
      </div>

      {/* Section FAQ rapide */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Questions fréquentes</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg">Comment créer un compte ?</h3>
            <p className="text-gray-600 mt-1">
              Cliquez sur le bouton "S'inscrire" en haut à droite et remplissez vos informations.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg">Comment ajouter un fournisseur ?</h3>
            <p className="text-gray-600 mt-1">
              Rendez-vous dans le module “Fournisseurs” puis cliquez sur "Ajouter Fournisseur".
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg">Comment filtrer les produits ?</h3>
            <p className="text-gray-600 mt-1">
              Utilisez la barre de recherche ou le menu déroulant dans le module “Produits”.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PageAide;
