from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenVerifyView
from .views import (
    CustomTokenObtainPairView,
    BoutiqueViewSet,
    PersonnelViewSet,
    AdminSignupView,
    BoutiqueSignupView,
    PersonnelSignupView,
    ActiviteViewSet,
    ProfilPersonnelViewSet,
    CurrencyView,
    PlanViewSet,
    SubscriptionViewSet,
    me,
    cookie_refresh,
    UserViewSet,
    logout_view,
)


router = DefaultRouter()
router.register(r'boutiques', BoutiqueViewSet, basename='boutique')
router.register(r'personnels', PersonnelViewSet, basename='personnel')
router.register(r'activites', ActiviteViewSet, basename='activite')
router.register(r'profil', ProfilPersonnelViewSet, basename='profil')
router.register(r'plans', PlanViewSet, basename='plans')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscriptions')
router.register(r'users', UserViewSet, basename="user")


urlpatterns = [
    # ---- CRUD ----
    path("", include(router.urls)),
    
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", cookie_refresh, name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("auth/me/", me, name="me"),

    path("signup/admin/", AdminSignupView.as_view(), name="signup_admin"),
    path("signup/boutique/", BoutiqueSignupView.as_view(), name="signup_boutique"),
    path("signup/personnel/", PersonnelSignupView.as_view(), name="signup_personnel"),
    path("currency/", CurrencyView.as_view(), name="currency"),
    path("auth/logout/", logout_view, name="auth_logout"),
]
