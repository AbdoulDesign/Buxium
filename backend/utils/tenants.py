def filter_by_tenant(queryset, user):
    """
    Applique le filtrage Multi-tenant sur un queryset
    en fonction du rôle de l'utilisateur.
    """
    if not user.is_authenticated:
        return queryset.none()

    role = getattr(user, "role", None)
    model_fields = [f.name for f in queryset.model._meta.fields]

    if "is_active" in model_fields:
        active_filter = {"is_active": True}
    elif "marchandise" in model_fields:
        active_filter = {"marchandise__is_active": True}
    else:
        active_filter = {}

    if role == "admin":
        return queryset.filter(**active_filter) if active_filter else queryset

    if role == "boutique" and hasattr(user, "boutique_profil"):
        if "boutique" in model_fields:
            return queryset.filter(boutique=user.boutique_profil, **active_filter)
        elif "marchandise" in model_fields:
            return queryset.filter(marchandise__boutique=user.boutique_profil, **active_filter)

    if role == "personnel" and hasattr(user, "personnel_profil") and user.personnel_profil.boutique:
        if "boutique" in model_fields:
            return queryset.filter(boutique=user.personnel_profil.boutique, **active_filter)
        elif "marchandise" in model_fields:
            return queryset.filter(marchandise__boutique=user.personnel_profil.boutique, **active_filter)

    return queryset.none()
