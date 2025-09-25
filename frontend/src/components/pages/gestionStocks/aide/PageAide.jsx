import React from "react";
import { FaWhatsapp, FaEnvelope, FaHeadset } from "react-icons/fa";

const PageAide = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Besoin d’aide ?
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Notre équipe est à votre disposition pour répondre à vos questions,
          résoudre vos problèmes et vous accompagner dans l’utilisation de la plateforme.
        </p>
      </header>

      {/* Section Contacts */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* WhatsApp */}
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition-transform transform hover:-translate-y-1">
          <FaWhatsapp className="text-green-500 text-6xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
          <p className="text-gray-600 mb-6">
            Chattez avec nous en direct pour une assistance rapide et personnalisée.
          </p>
          <a
            href="https://wa.me/22601574485"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition"
          >
            Discuter sur WhatsApp
          </a>
        </div>

        {/* Email */}
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition-transform transform hover:-translate-y-1">
          <FaEnvelope className="text-blue-500 text-6xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Email</h3>
          <p className="text-gray-600 mb-6">
            Envoyez-nous vos demandes détaillées et nous vous répondrons sous 24h.
          </p>
          <a
            href="mailto:buxium.contact@gmail.com"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition"
          >
            Envoyer un Email
          </a>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition-transform transform hover:-translate-y-1">
          <FaHeadset className="text-purple-500 text-6xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Assistance Technique</h3>
          <p className="text-gray-600 mb-6">
            Un problème urgent ? Contactez directement notre équipe technique pour une prise en charge prioritaire.
          </p>
          <a
            href="mailto:buxium.contact@gmail.com"
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-semibold transition"
          >
            Contacter le Support
          </a>
        </div>
      </div>

      {/* Section FAQ rapide */}
      <section className="mt-20 max-w-5xl mx-auto">
  <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
    Questions fréquentes (FAQ)
  </h2>
  <div className="space-y-6">
    {/* Q1 */}
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <h3 className="font-semibold text-lg text-gray-800">
        Comment créer un compte et démarrer ?
      </h3>
      <p className="text-gray-600 mt-2">
        Cliquez sur le bouton <strong>"S'inscrire"</strong> en haut à droite de la page
        d’accueil et complétez vos informations. Une fois validé, vous pouvez
        accéder immédiatement à toutes les fonctionnalités selon votre formule
        d’abonnement.
      </p>
    </div>

    {/* Q2 */}
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <h3 className="font-semibold text-lg text-gray-800">
        Comment gérer mes fournisseurs et mes produits ?
      </h3>
      <p className="text-gray-600 mt-2">
        Depuis le module <strong>“Fournisseurs”</strong>, ajoutez vos partenaires en
        quelques clics. Ensuite, dans le module <strong>“Marchandises”</strong>, vous pouvez
        créer vos articles, ajouter des photos, fixer des prix, suivre vos stocks
        en temps réel et recevoir des alertes automatiques en cas de rupture.
      </p>
    </div>

    {/* Q3 */}
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <h3 className="font-semibold text-lg text-gray-800">
        Puis-je suivre mes ventes et générer des rapports ?
      </h3>
      <p className="text-gray-600 mt-2">
        Oui ✅. Chaque vente est automatiquement enregistrée dans le système.
        Vous pouvez consulter vos <strong>rapports financiers détaillés</strong>, analyser
        vos marges, suivre les produits les plus vendus et exporter vos données
        en PDF/Excel pour vos besoins administratifs.
      </p>
    </div>

    {/* Q4 */}
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <h3 className="font-semibold text-lg text-gray-800">
        Comment fonctionnent les abonnements ?
      </h3>
      <p className="text-gray-600 mt-2">
        Nos abonnements sont <strong>clairs et transparents</strong>. Vous choisissez la
        formule qui correspond à vos besoins (mensuelle ou annuelle) et profitez
        de toutes les fonctionnalités incluses. ⚠️ <em>Conformément à nos CGU,
        les paiements ne sont ni remboursables ni annulables.</em>
      </p>
    </div>

    {/* Q5 */}
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <h3 className="font-semibold text-lg text-gray-800">
        Mes données sont-elles sécurisées ?
      </h3>
      <p className="text-gray-600 mt-2">
        Absolument 🔒. Nous utilisons un hébergement sécurisé, des connexions
        chiffrées (<strong>HTTPS/SSL</strong>) et des sauvegardes régulières pour garantir
        la confidentialité et la sécurité de toutes vos informations.
      </p>
    </div>
  </div>
</section>

      {/* Footer Call-to-Action */}
      <footer className="mt-20 text-center">
        <p className="text-gray-600 mb-4">
          Toujours bloqué ou besoin d’assistance personnalisée ?
        </p>
        <a
          href="mailto:buxium.contact@gmail.com"
          className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-semibold shadow transition"
        >
          Contacter notre équipe
        </a>
      </footer>
    </div>
  );
};

export default PageAide;
