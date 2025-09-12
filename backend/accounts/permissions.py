from rest_framework.permissions import BasePermission
from django.utils import timezone
from accounts.models import Subscription, Utilisateur, Entreprise


class HasActiveSubscription(BasePermission):
    """
    Permission personnalisée : l'utilisateur doit être authentifié
    et lié à une entreprise qui a un abonnement actif.
    """
    message = "⛔ Votre abonnement est expiré ou inexistant."

    def has_permission(self, request, view):
        user = request.user

        # Si pas connecté → pas d'accès
        if not user or not user.is_authenticated:
            return False

        # 🔹 Si c’est un Utilisateur, remonter à son entreprise
        entreprise = getattr(user, "entreprise", None)

        # 🔹 Si c’est directement une Entreprise (login direct)
        if entreprise is None and isinstance(user, Entreprise):
            entreprise = user

        if entreprise is None:
            return False

        # Vérifier si l'entreprise a un abonnement actif
        return Subscription.objects.filter(
            entreprise=entreprise,
            is_active=True,
            end_date__gte=timezone.now()
        ).exists()
