class MultiTenantMixin:
    """
    Mixin pour restreindre automatiquement le queryset
    à la boutique de l'utilisateur connecté.

    - Admin : accès global
    - Boutique : uniquement sa propre boutique
    - Personnel : uniquement la boutique à laquelle il est lié
    """

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if not user.is_authenticated:
            return qs.none()

        role = getattr(user, "role", None)

        # Vérifier les champs disponibles du modèle
        model_fields = [f.name for f in qs.model._meta.fields]

        # ⚡ Déterminer la clé du filtre actif
        if "is_active" in model_fields:
            active_filter = {"is_active": True}
        elif "marchandise" in model_fields:
            active_filter = {"marchandise__is_active": True}
        else:
            active_filter = {}

        # Cas spécial : si on liste directement les boutiques
        if qs.model.__name__ == "Boutique":
            if role == "admin":
                return qs.filter(**active_filter) if active_filter else qs

            if role == "boutique":
                return qs.filter(user=user, **active_filter)

            if role == "personnel":
                if hasattr(user, "personnel_profil") and user.personnel_profil.boutique:
                    return qs.filter(id=user.personnel_profil.boutique.id, **active_filter)
                return qs.none()

        # Cas général : les modèles liés à une boutique
        if role == "admin":
            return qs.filter(**active_filter) if active_filter else qs

        if role == "boutique":
            if hasattr(user, "boutique_profil"):
                return qs.filter(boutique=user.boutique_profil, **active_filter)
            return qs.none()

        if role == "personnel":
            if hasattr(user, "personnel_profil") and user.personnel_profil.boutique:
                return qs.filter(boutique=user.personnel_profil.boutique, **active_filter)
            return qs.none()

        return qs.none()
