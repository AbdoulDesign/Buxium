import { Button } from "../../ui/";
import { Menu, Package, BarChart3, ShoppingCart, DollarSign, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0f2f28] to-black text-white font-inter">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4 fixed w-full top-0 bg-black/40 backdrop-blur-lg z-50 border-b border-white/10">
                <div className="text-2xl font-bold">
                    <span className="text-[#43AB8A]">
                        B<span className="text-white">uxium</span>
                    </span>
                </div>
                <ul className="hidden md:flex gap-6 text-sm">
                    <li className="hover:text-[#43AB8A] cursor-pointer">Accueil</li>
                    <li className="hover:text-[#43AB8A] cursor-pointer">Fonctionnalités</li>
                    <li className="hover:text-[#43AB8A] cursor-pointer">Abonnement</li>
                    <li className="hover:text-[#43AB8A] cursor-pointer">À propos</li>
                    <li className="hover:text-[#43AB8A] cursor-pointer">Contact</li>
                </ul>
                <Link
        to="/auth/login"
        className="hidden md:block bg-[#43AB8A] text-white px-5 py-2 rounded-full shadow-lg hover:bg-[#369273] transition"
      >
        Essayer Gratuitement
      </Link>
                <Menu className="md:hidden" />
            </nav>

            {/* Hero */}
            <section className="flex flex-col md:flex-row items-center justify-between px-12 md:px-24 min-h-screen pt-20">
                <div className="max-w-xl">
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
                        Gérez votre commerce <span className="text-[#43AB8A]">intelligemment</span>
                    </h2>
                    <p className="text-gray-300 mb-6">
                        Un logiciel tout-en-un pour vos ventes, achats, inventaires et finances.
                        Gagnez du temps et boostez votre rentabilité.
                    </p>
                    <div className="flex gap-4">
                        <Button className="bg-[#43AB8A] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#369273]">
                            Essayer Gratuitement
                        </Button>
                        <Button variant="outline" className="border border-white/40 px-6 py-3 rounded-xl">
                            Voir une démo
                        </Button>
                    </div>
                </div>
                <div className="mt-12 md:mt-0">
                    <div className="w-[400px] h-[300px] bg-white/10 rounded-2xl shadow-xl flex items-center justify-center">
                        <span className="text-gray-400">[Dashboard Preview]</span>
                    </div>
                </div>
            </section>

            {/* Fonctionnalités */}
            <section className="py-24 px-12 md:px-24">
                <h3 className="text-3xl font-bold text-center mb-12">Fonctionnalités principales</h3>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard icon={<Package size={32} />} title="Gestion des Stocks" text="Suivi en temps réel, seuils d’alerte et inventaires simplifiés." />
                    <FeatureCard icon={<ShoppingCart size={32} />} title="Ventes & Achats" text="Factures, tickets et suivi de vos transactions en toute simplicité." />
                    <FeatureCard icon={<DollarSign size={32} />} title="Finance & Comptabilité" text="Suivi des revenus, dépenses et bénéfices nets." />
                    <FeatureCard icon={<BarChart3 size={32} />} title="Tableaux de Bord" text="Analyses et rapports détaillés pour de meilleures décisions." />
                    <FeatureCard icon={<Users size={32} />} title="Multi-utilisateurs" text="Invitez vos employés et gérez les rôles et permissions." />
                    <FeatureCard icon={<Package size={32} />} title="Gestion Fournisseurs/Clients" text="Gardez vos relations commerciales organisées." />
                </div>
            </section>

            {/* Pricing */}
            <section className="py-24 px-12 md:px-24 bg-black/30">
                <h3 className="text-3xl font-bold text-center mb-12">Nos abonnements</h3>
                <div className="grid md:grid-cols-3 gap-8">
                    <PricingCard title="Basique" price="15€/mois" features={["Gestion stock", "Ventes & Achats", "1 utilisateur"]} />
                    <PricingCard title="Pro" price="39€/mois" features={["Tout Basique", "Comptabilité", "5 utilisateurs", "Rapports avancés"]} highlighted />
                    <PricingCard title="Entreprise" price="Sur mesure" features={["Tout Pro", "Utilisateurs illimités", "Support dédié", "API & Intégrations"]} />
                </div>
            </section>

            {/* À propos */}
            <section className="py-24 px-12 md:px-24">
                <div className="max-w-3xl mx-auto text-center">
                    <h3 className="text-3xl font-bold mb-6">À propos de <span className="font-bold text-[#43AB8A]">
                        B<span className="text-white">uxium</span>
                    </span></h3>
                    <p className="text-gray-300">
                        Notre mission est d’aider les commerçants, restaurateurs et entrepreneurs à simplifier
                        la gestion quotidienne de leurs activités grâce à une solution moderne et intuitive.
                        Nous croyons en l’innovation et en la technologie pour booster la rentabilité.
                    </p>
                </div>
            </section>

            {/* Contact */}
            <section className="py-24 px-12 md:px-24 bg-black/40">
                <h3 className="text-3xl font-bold text-center mb-12">Contactez-nous</h3>
                <div className="max-w-xl mx-auto">
                    <form className="grid gap-6">
                        <input type="text" placeholder="Votre nom" className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none" />
                        <input type="email" placeholder="Votre email" className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none" />
                        <textarea placeholder="Votre message" rows="4" className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"></textarea>
                        <Button className="bg-[#43AB8A] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#369273]">
                            Envoyer
                        </Button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-gray-400 border-t border-white/10">
                <p>© {new Date().getFullYear()} <span className="font-bold text-[#43AB8A]">
                    B<span className="text-white">uxium</span>
                </span>. Tous droits réservés.</p>
                <div className="flex justify-center gap-4 mt-4">
                    <a href="#" className="hover:text-white">Mentions légales</a>
                    <a href="#" className="hover:text-white">Confidentialité</a>
                    <a href="#" className="hover:text-white">Conditions</a>
                </div>
            </footer>
        </div>
    );
}

// Components réutilisables
function FeatureCard({ icon, title, text }) {
    return (
        <div className="bg-white/5 p-6 rounded-2xl shadow-lg hover:bg-white/10 transition">
            <div className="text-[#43AB8A] mb-4">{icon}</div>
            <h4 className="text-xl font-semibold mb-2">{title}</h4>
            <p className="text-gray-300">{text}</p>
        </div>
    );
}

function PricingCard({ title, price, features, highlighted }) {
    return (
        <div className={`p-8 rounded-2xl shadow-xl border ${highlighted ? "border-[#43AB8A] bg-white/10" : "border-white/10 bg-white/5"}`}>
            <h4 className="text-2xl font-bold mb-4">{title}</h4>
            <p className="text-3xl font-extrabold mb-6 text-[#43AB8A]">{price}</p>
            <ul className="mb-6 space-y-2 text-gray-300">
                {features.map((f, i) => <li key={i}>✅ {f}</li>)}
            </ul>
            <Button className="w-full bg-[#43AB8A] hover:bg-[#369273]">Choisir</Button>
        </div>
    );
}
