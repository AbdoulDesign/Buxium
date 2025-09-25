import React, { useState, useEffect } from "react";
import {
    FiUser,
    FiLock,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBriefcase,
    FiImage,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../Api";
import logo_transparent from "../../assets/logo_transparent.png";

const SignupBoutique = () => {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        name: "",
        adresse: "",
        telephone: "",
        activite: "",
        confirmPassword: "",
        logo: null,
        is_active: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activites, setActivites] = useState(null);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({}); // erreurs serveur


    useEffect(() => {
        const fetchActivites = async () => {
            try {
                const res = await api.get("accounts/activites/");
                setActivites(res.data);
            } catch (err) {
                console.error("Erreur lors du chargement des activités", err);
            }
        };
        fetchActivites();
    }, []);

    // Gérer la saisie
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setForm({ ...form, [name]: files[0] });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    // Aller à l'étape suivante
    const handleNext = () => {
        if (form.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        setError("");
        setStep(2);
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();
            Object.keys(form).forEach((key) => {
                if (form[key]) formData.append(key, form[key]);
            });

            await api.post("accounts/signup/boutique/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSuccess("Votre inscription a été réalisée avec succès !");

            setTimeout(() => {
                window.location.href = "/auth/login";
            }, 2000);

            setForm({
                username: "",
                email: "",
                password: "",
                name: "",
                adresse: "",
                telephone: "",
                activite: "",
                confirmPassword: "",
                logo: null,
                is_active: true,
            });
            setStep(1);
            setErrors({});
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrors(error.response.data); // récupère directement les erreurs backend
            } else {
                setErrors({ global: ["Une erreur inattendue est survenue."] });
            }
        } finally {
            setLoading(false);
        }
    };

    // Animations
    const slideVariants = {
        initial: { x: "100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden relative">
                <div className="text-center mb-6">
                    <div className="text-4xl font-extrabold tracking-tight flex items-center justify-center gap-2">
                                        <img
                                                src={logo_transparent}
                                                alt="Buxium Logo"
                                                className="h-10 w-10 object-contain"
                                              />
                                        <span className="text-black/70">Buxium</span>
                                      </div>
                    <p className="text-gray-600 text-sm mt-2">
                        Créez votre compte boutique pour démarrer avec votre espace de
                        gestion.
                    </p>
                </div>

                {/* Messages globaux */}
                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}
                {success && (
                    <p className="text-green-600 text-sm mb-4 text-center">{success}</p>
                )}

                {success && (
                    <div className="text-center bg-green-100 text-green-700 p-3 rounded-md mb-4">
                        {success}
                    </div>
                )}

                <form className="relative" onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={slideVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.5 }}
                                className="space-y-5"
                            >
                                {/* Username */}
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        Nom utilisateur
                                    </label>
                                    <div className="relative">
                                        <FiUser className="absolute top-3 left-3 text-gray-400" />
                                        <input
                                            type="text"
                                            name="username"
                                            value={form.username}
                                            onChange={handleChange}
                                            placeholder="Nom d'utilisateur"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.username && <p className="text-red-500 text-sm">{errors.username[0]}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <FiMail className="absolute top-3 left-3 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="email@example.com"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email[0]}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <FiLock className="absolute top-3 left-3 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm">{errors.password[0]}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        Confirmer mot de passe
                                    </label>
                                    <div className="relative">
                                        <FiLock className="absolute top-3 left-3 text-gray-400" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword[0]}</p>}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full bg-[#43AB8A] text-white py-2 rounded-lg hover:bg-[#369873] transition"
                                >
                                    Suivant →
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={slideVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.5 }}
                                className="space-y-5"
                            >
                                {/* Nom Boutique */}
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        Nom de la boutique
                                    </label>
                                    <div className="relative">
                                        <FiBriefcase className="absolute top-3 left-3 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Nom de votre boutique"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.adresse && <p className="text-red-500 text-sm">{errors.adresse[0]}</p>}
                                </div>

                                {/* Adresse */}
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        Adresse
                                    </label>
                                    <div className="relative">
                                        <FiMapPin className="absolute top-3 left-3 text-gray-400" />
                                        <input
                                            type="text"
                                            name="adresse"
                                            value={form.adresse}
                                            onChange={handleChange}
                                            placeholder="Adresse complète"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300"
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.adresse && <p className="text-red-500 text-sm">{errors.adresse[0]}</p>}
                                </div>

                                {/* Téléphone */}
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        Téléphone
                                    </label>
                                    <div className="relative">
                                        <FiPhone className="absolute top-3 left-3 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="telephone"
                                            value={form.telephone}
                                            onChange={handleChange}
                                            placeholder="Numéro de téléphone"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300"
                                            disabled={loading}
                                            pattern="[0-9]{8,15}"   // uniquement chiffres, min 8 max 15
                                            title="Veuillez entrer uniquement des chiffres (8 à 15 caractères)."
                                        />
                                    </div>
                                    {errors.telephone && <p className="text-red-500 text-sm">{errors.telephone[0]}</p>}
                                </div>

                                {/* Activité */}
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        Type d'activité
                                    </label>
                                    <select
                                        name="activite"
                                        value={form.activite}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">-- Sélectionnez une activité --</option>
                                        {activites.map((act) => (
                                            <option key={act.id} value={act.id}>
                                                {act.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Logo */}
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        Logo (optionnel)
                                    </label>
                                    <div className="relative">
                                        <FiImage className="absolute top-3 left-3 text-gray-400" />
                                        <input
                                            type="file"
                                            name="logo"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300"
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.logo && <p className="text-red-500 text-sm">{errors.logo[0]}</p>}
                                </div>

                                {/* Erreurs globales */}
                                {errors.non_field_errors && (
                                    <p className="text-red-600 font-medium">{errors.non_field_errors[0]}</p>
                                )}
                                {errors.global && (
                                    <p className="text-red-600 font-medium">{errors.global[0]}</p>
                                )}

                                <div>
                                    {errors.username && <p className="text-red-500 text-sm">{errors.username[0]}</p>}
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email[0]}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-lg bg-[#43AB8A] hover:bg-[#369873] text-white font-semibold transition"
                                >
                                    {loading ? "Création..." : "Valider ✅"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
};

export default SignupBoutique;
