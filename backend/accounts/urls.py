from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EntrepriseViewSet,
    UtilisateurViewSet,
    LoginView,
    ActiviteViewSet,
    RoleViewSet,
    CurrencyView,
    PlanViewSet,
    SubscriptionViewSet,
    PaymentViewSet,
    RefreshTokenView,
)


# Création du router DRF
router = DefaultRouter()
router.register(r'entreprises', EntrepriseViewSet, basename='entreprise')
router.register(r'utilisateurs', UtilisateurViewSet, basename='utilisateur')
router.register(r'activites', ActiviteViewSet, basename='activite')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'plans', PlanViewSet, basename='plans')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscriptions')
router.register(r'payments', PaymentViewSet, basename='payments')


urlpatterns = [
    path('', include(router.urls)),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", RefreshTokenView.as_view(), name="token_refresh"),
    path("currency/", CurrencyView.as_view(), name="currency"),
]


"""
 - POST /entreprises/{id}/set_password/  → Changer de mot de passe 
"""