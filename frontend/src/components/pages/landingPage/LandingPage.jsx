import React from "react";
import { Button } from "../../ui/";
import {
  Menu,
  Package,
  BarChart3,
  ShoppingCart,
  DollarSign,
  Users,
  Check,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiTrendingUp, FiUsers, FiShield } from "react-icons/fi";
import img from "../../../assets/img.png";
import { useState } from "react";
import logo_transparent from "../../../assets/logo_transparent.png";

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ["Accueil", "Fonctionnalités", "Abonnement", "À propos", "Contact"];
  const missions = [
    {
      icon: <FiTrendingUp className="w-12 h-12 text-indigo-500" />,
      title: "Croissance",
      description:
        "Nous aidons les commerces à croître avec des outils innovants, des analyses précises et un suivi en temps réel.",
      bg: "from-indigo-100/60 to-purple-100/40",
    },
    {
      icon: <FiUsers className="w-12 h-12 text-pink-500" />,
      title: "Communauté",
      description:
        "Créer un écosystème où commerçants et clients collaborent pour générer de la valeur mutuelle et durable.",
      bg: "from-pink-100/60 to-rose-100/40",
    },
    {
      icon: <FiShield className="w-12 h-12 text-green-500" />,
      title: "Confiance",
      description:
        "Assurer sécurité, transparence et fiabilité à travers chaque interaction et chaque transaction.",
      bg: "from-green-100/60 to-emerald-100/40",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-800 font-inter">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <div className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <img
                  src={logo_transparent}
                  alt="Buxium Logo"
                  className="h-10 w-10 object-contain"
                />
          <span className="text-black/70">Buxium</span>
        </div>
        {/* Menu Desktop */}
        <ul className="hidden md:flex gap-8 text-sm font-medium">
          {navItems.map((item, i) => (
            <li
              key={i}
              className="cursor-pointer relative group text-gray-700 hover:text-[#43AB8A] transition"
            >
              {item}
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-[#43AB8A] group-hover:w-full transition-all"></span>
            </li>
          ))}
        </ul>

        {/* Boutons Desktop */}
        <div className="hidden md:flex gap-3">
          <Link
            to="/inscription"
            className="border border-[#43AB8A] text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-[#43AB8A] hover:text-white transition shadow-sm"
          >
            S'inscrire
          </Link>
          <Link
            to="/auth/login"
            className="bg-[#43AB8A] text-white px-5 py-2 rounded-full font-medium hover:bg-[#369273] transition shadow-md"
          >
            Essai Gratuit
          </Link>
        </div>

        {/* Bouton Mobile */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu Mobile (déroulant) */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-100">
          <ul className="flex flex-col items-center gap-6 py-6 text-sm font-medium">
            {navItems.map((item, i) => (
              <li
                key={i}
                className="cursor-pointer text-gray-700 hover:text-[#43AB8A] transition"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 px-8 pb-6">
            <Link
              to="/inscription"
              className="border border-[#43AB8A] text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-[#43AB8A] hover:text-white transition shadow-sm text-center"
              onClick={() => setIsOpen(false)}
            >
              S'inscrire
            </Link>
            <Link
              to="/auth/login"
              className="bg-[#43AB8A] text-white px-5 py-2 rounded-full font-medium hover:bg-[#369273] transition shadow-md text-center"
              onClick={() => setIsOpen(false)}
            >
              Essai Gratuit
            </Link>
          </div>
        </div>
      )}
    </nav>

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-24 min-h-screen pt-28 relative overflow-hidden">
        {/* Gradient circles décoratives */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#43AB8A]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl"></div>

        <motion.div
          className="max-w-2xl relative z-10"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Gérez votre commerce{" "}
            <span className="bg-gradient-to-r from-[#43AB8A] to-teal-400 bg-clip-text text-transparent">
              intelligemment
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Une plateforme tout-en-un pour vos ventes, achats, inventaires et
            finances. Automatisez vos tâches, gagnez du temps et boostez votre
            rentabilité.
          </p>
          <div className="flex gap-4">
            <Button className="bg-[#43AB8A] text-white px-8 py-3 rounded-xl shadow-lg hover:bg-[#369273] transition md:text-lg">
              Essai Gratuit
            </Button>
            <Button
              variant="outline"
              className="border border-gray-300 px-8 py-3 rounded-xl md:text-lg hover:bg-gray-100"
            >
              Voir une démo
            </Button>
          </div>
        </motion.div>

        {/* Mock dashboard preview */}
        <motion.div
          className="mt-16 md:mt-0 relative"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="w-[600px] bg-white rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden">
  <img
    src={img}
    alt="Dashboard Preview"
    className="w-full h-full object-cover transition duration-500 ease-in-out hover:rotate-4 hover:opacity-90"
  />
</div>
        </motion.div>
      </section>

      {/* Notre Mission */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-[#43AB8A] to-[#43AB8A]"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Notre mission
          </motion.h2>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
            {missions.map((mission, index) => (
              <motion.div
                key={index}
                className={`relative rounded-2xl bg-gradient-to-br ${mission.bg} p-10 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.7 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-center">{mission.icon}</div>
                <h3 className="mt-6 text-xl font-bold text-gray-800">
                  {mission.title}
                </h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {mission.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-24 px-6 md:px-24">
        <h2 className="text-3xl font-bold text-center mb-16">
          Fonctionnalités clés
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard
            icon={<Package size={36} />}
            title="Gestion des Stocks"
            text="Suivi en temps réel, seuils d’alerte et inventaires simplifiés."
          />
          <FeatureCard
            icon={<ShoppingCart size={36} />}
            title="Ventes & Achats"
            text="Factures, tickets et suivi complet des transactions."
          />
          <FeatureCard
            icon={<DollarSign size={36} />}
            title="Finance & Comptabilité"
            text="Suivi de revenus, dépenses et rapports financiers détaillés."
          />
          <FeatureCard
            icon={<BarChart3 size={36} />}
            title="Tableaux de Bord"
            text="Rapports et analyses pour des décisions éclairées."
          />
          <FeatureCard
            icon={<Users size={36} />}
            title="Multi-utilisateurs"
            text="Invitez vos employés et gérez leurs rôles facilement."
          />
          <FeatureCard
            icon={<Package size={36} />}
            title="Fournisseurs"
            text="Gestion complète des relations commerciales et historiques."
          />
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-24 px-6 md:px-24 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-16">
          Ils nous font confiance
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          <TestimonialCard
            name="Aissatou D."
            role="Commerçante"
            text="Buxium a transformé la gestion de mon magasin, simple et intuitif."
          />
          <TestimonialCard
            name="Mamadou K."
            role="Restaurateur"
            text="Je gagne du temps et j'ai une visibilité totale sur mes finances."
          />
          <TestimonialCard
            name="Sita B."
            role="Entrepreneuse"
            text="Enfin un logiciel adapté à mes besoins de suivi quotidien."
          />
        </div>
      </section>

      {/* Abonnements */}
      <section className="py-24 px-6 md:px-24">
        <h2 className="text-3xl font-bold text-center mb-16">
          Nos abonnements
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {/* Essai Gratuit */}
          <PricingCardNew
            title="Essai Gratuit"
            price="7 jours"
            features={[
              "Accès aux fonctionnalités de base",
              "Gestion simple des marchandises",
            ]}
          />

          {/* Mensuel */}
          <PricingCardNew
            title="Mensuel"
            price="500 FCFA / mois"
            highlighted
            features={[
              "Gestion complète des stocks avec alertes automatiques",
              "Inventaires en temps réel",
              "Suivi des ventes et achats",
              "Tableaux de bord financiers intelligents",
              "Jusqu’à 3 utilisateurs avec rôles et permissions",
              "Rapports avancés (CA, marges, best-sellers, pertes)",
              "Export Excel / PDF",
            ]}
          />

          {/* Trimestriel */}
          <PricingCardNew
            title="Trimestriel"
            price="1000 FCFA / trimestre"
            features={[
              "Toutes les fonctionnalités du plan Mensuel",
              "Jusqu’à 3 utilisateurs avec rôles et permissions",
              "API & intégrations (paiement, ERP, WhatsApp)",
              "Suivi multi-boutiques et multi-agents",
            ]}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 border-t border-gray-200">
        <p>© {new Date().getFullYear()} Buxium. Tous droits réservés.</p>
        <div className="flex justify-center gap-6 mt-4">
          {["Mentions légales", "Confidentialité", "Conditions"].map(
            (link, i) => (
              <a
                key={i}
                href="#"
                className="hover:text-gray-800 transition-colors"
              >
                {link}
              </a>
            )
          )}
        </div>
      </footer>
    </div>
  );
}

/* Components réutilisables */
function FeatureCard({ icon, title, text }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition"
    >
      <div className="text-[#43AB8A] mb-5">{icon}</div>
      <h4 className="text-xl font-semibold mb-3">{title}</h4>
      <p className="text-gray-600">{text}</p>
    </motion.div>
  );
}

function TestimonialCard({ name, role, text }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition"
    >
      <p className="italic text-gray-600 mb-6">"{text}"</p>
      <h4 className="font-bold text-lg">{name}</h4>
      <p className="text-sm text-gray-400">{role}</p>
    </motion.div>
  );
}

function PricingCardNew({ title, price, features, highlighted }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-3xl p-10 flex flex-col items-center text-center backdrop-blur-xl border shadow-xl transition 
        ${highlighted
          ? "bg-gradient-to-br from-[#43AB8A]/10 to-teal-100/30 border-[#43AB8A] shadow-2xl"
          : "bg-white/70 border-gray-200"
        }`}
    >
      {/* Badge si populaire */}
      {highlighted && (
        <div className="absolute top-0 -translate-y-1/2 bg-gradient-to-r from-[#43AB8A] to-teal-500 text-white px-5 py-1 rounded-full text-sm font-semibold shadow-lg">
          Populaire
        </div>
      )}

      {/* Header */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#43AB8A] to-teal-500 flex items-center justify-center shadow-md mb-6">
        <DollarSign className="text-white w-8 h-8" />
      </div>
      <h3 className="text-2xl font-extrabold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600 text-lg mb-8">{price}</p>

      {/* Liste des fonctionnalités */}
      <ul className="text-gray-700 mb-8 space-y-4 text-left w-full">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="mt-1">
              <Check className="text-[#43AB8A] w-5 h-5" />
            </div>
            <span className="leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>

      {/* Bouton */}
      <Button
        className={`w-full py-3 rounded-xl font-semibold tracking-wide ${highlighted
            ? "bg-[#43AB8A] text-white hover:bg-[#369273] shadow-md"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
      >
        Choisir
      </Button>
    </motion.div>
  );
}
