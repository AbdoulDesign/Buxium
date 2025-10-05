from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    BoutiqueSerializer,
    PersonnelSerializer,
    CustomTokenObtainPairSerializer,
    AdminSignupSerializer,
    BoutiqueSignupSerializer,
    PersonnelSignupSerializer,
    UserSerializer,
    ActiviteSerializer,
    ProfilPersonnelSerializer,
    PlanSerializer,
    SubscriptionSerializer,
    SetNewPasswordSerializer,
    PersonnelUpdateSerializer,
    UserMeSerializer,
)
from .permissions import IsAdmin, IsBoutique, IsPersonnel
from .models import ( User, Boutique, Personnel, Activite, ProfilPersonnel,
Plan, Subscription, Boutique, Personnel
)
from rest_framework_simplejwt.exceptions import TokenError
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from django.conf import settings
from core.mixins import MultiTenantMixin
from rest_framework_simplejwt.tokens import RefreshToken




class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


# ----- Login avec cookies sécurisés -----
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            data = response.data

            # Déplacer refresh en HttpOnly cookie
            response.set_cookie(
                key="refresh_token",
                value=data["refresh"],
                httponly=True,
                secure=not settings.DEBUG,
                samesite="Lax",
                max_age=7 * 24 * 60 * 60,
            )

            # Supprimer refresh du body
            del data["refresh"]
            response.data = data

        return response



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserMeSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


class ActiviteViewSet(viewsets.ModelViewSet):
    queryset = Activite.objects.all()
    serializer_class = ActiviteSerializer
    permission_classes = []

class ProfilPersonnelViewSet(viewsets.ModelViewSet):
    queryset = ProfilPersonnel.objects.all()
    serializer_class = ProfilPersonnelSerializer
    permission_classes = []


# -----------------------
# CRUD Boutique
# -----------------------
class BoutiqueViewSet(MultiTenantMixin, viewsets.ModelViewSet):
    queryset = Boutique.objects.all()
    serializer_class = BoutiqueSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated()]
        return [IsAuthenticated()]


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if request.query_params.get("hard") == "true":
            instance.delete()
            return Response(
                {"message": f"Boutique '{instance.user.username}' supprimée définitivement"},
                status=status.HTTP_200_OK,
            )

        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Boutique '{instance.user.username}' désactivée"},
            status=status.HTTP_200_OK,
        )


    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdmin])
    def restore(self, request, pk=None):
        try:
            instance = Boutique.objects.get(pk=pk, is_active=False)
        except Boutique.DoesNotExist:
            return Response(
                {"error": "Cette boutique n'existe pas ou est déjà active."},
                status=status.HTTP_404_NOT_FOUND,
            )
        instance.is_active = True
        instance.save(update_fields=["is_active"])
        return Response({"message": f"Boutique '{instance.user.username}' restaurée"})


    @action(detail=False, methods=["get"])
    def archived(self, request):
        archived_items = Boutique.objects.filter(is_active=False)
        serializer = self.get_serializer(archived_items, many=True)
        return Response(serializer.data)


# -----------------------
# CRUD Personnel
# -----------------------

class PersonnelViewSet(MultiTenantMixin, viewsets.ModelViewSet):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return PersonnelUpdateSerializer
        if self.action == "create":
            return PersonnelSignupSerializer
        return PersonnelSerializer

    def update(self, request, *args, **kwargs):
        # on utilise le serializer Update pour valider et sauvegarder
        super().update(request, *args, **kwargs)
        # puis on renvoie l'objet avec le serializer principal (avec user inclus)
        instance = self.get_object()
        return Response(
            PersonnelSerializer(instance, context=self.get_serializer_context()).data
        )

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsBoutique()]
        return [IsAuthenticated()]


    def create(self, request, *args, **kwargs):
        user = request.user
        if user.role != "boutique":
            return Response(
                {"detail": "Seules les boutiques peuvent créer du personnel."},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        data["boutique"] = user.boutique_profil.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if request.query_params.get("hard") == "true":
            instance.delete()
            return Response(
                {"message": f"Personnel '{instance.user.username}' supprimé définitivement"},
                status=status.HTTP_200_OK,
            )

        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Personnel '{instance.user.username}' désactivé"},
            status=status.HTTP_200_OK,
        )


    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdmin])
    def restore(self, request, pk=None):
        try:
            instance = Personnel.objects.get(pk=pk, is_active=False)
        except Personnel.DoesNotExist:
            return Response(
                {"error": "Ce personnel n'existe pas ou est déjà actif."},
                status=status.HTTP_404_NOT_FOUND,
            )
        instance.is_active = True
        instance.save(update_fields=["is_active"])
        return Response({"message": f"Personnel '{instance.user.username}' restauré"})


    @action(detail=False, methods=["get"])
    def archived(self, request):
        archived_items = Personnel.objects.filter(is_active=False)
        serializer = self.get_serializer(archived_items, many=True)
        return Response(serializer.data)
    

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def set_password(self, request, pk=None):
        personnel = self.get_object()
        serializer = SetNewPasswordSerializer(
            data=request.data,
            context={'user': personnel.user}  # ⚠️ passer l'objet User
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Mot de passe changé avec succès."},
            status=status.HTTP_200_OK
        )

# -----------------------
# Signup API
# -----------------------

# ---- Signup Admin ----
class AdminSignupView(generics.CreateAPIView):
    serializer_class = AdminSignupSerializer
    permission_classes = []  # Seul un admin peut créer un autre admin


# ---- Signup Boutique ----
class BoutiqueSignupView(generics.CreateAPIView):
    serializer_class = BoutiqueSignupSerializer
    permission_classes = []  # ✅ la création d'une boutique est public


class PersonnelSignupView(generics.CreateAPIView):
    serializer_class = PersonnelSignupSerializer
    permission_classes = [IsAuthenticated, IsBoutique]

    def perform_create(self, serializer):
        # Si l'utilisateur connecté est une boutique, on utilise sa boutique
        if hasattr(self.request.user, 'boutique_profil'):
            serializer.save(boutique=self.request.user.boutique_profil)
        else:
            # Sinon, on utilise la boutique passée dans les données
            # Le serializer gérera déjà cela via le champ boutique_id
            serializer.save()


class CurrencyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retourne la devise actuelle (par défaut FCFA)
        """
        currency = request.session.get("currency", "FCFA")
        return Response({"currency": currency})

    def post(self, request):
        """
        Met à jour la devise choisie par l'utilisateur
        """
        currency = request.data.get("currency")
        allowed = ["FCFA", "EUR", "USD", "GNF"]
        if currency not in allowed:
            return Response({"error": "Devise invalide"}, status=400)

        request.session["currency"] = currency
        return Response({"currency": currency})


# -------- Plans disponibles --------
class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]


# -------- Abonnement --------
class SubscriptionViewSet(MultiTenantMixin, viewsets.ModelViewSet):
    """
    Gestion des abonnements (Subscription)
    - Les boutiques peuvent créer leur propre abonnement
    - L'admin peut créer ou supprimer un abonnement pour n'importe quelle boutique
    """
    queryset = Subscription.objects.all().select_related("boutique", "plan")
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user

        # ✅ Autoriser admin à créer un abonnement pour n’importe quelle boutique
        if user.is_superuser or getattr(user, "role", None) == "admin":
            boutique_id = request.data.get("boutique")
            if not boutique_id:
                return Response(
                    {"detail": "Boutique requise pour la création par un administrateur."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                boutique = Boutique.objects.get(id=boutique_id)
            except Boutique.DoesNotExist:
                return Response(
                    {"detail": "Boutique introuvable."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # 🔒 Les utilisateurs non admin doivent être des boutiques
            if getattr(user, "role", None) != "boutique":
                return Response(
                    {"detail": "Seules les boutiques ou les administrateurs peuvent souscrire."},
                    status=status.HTTP_403_FORBIDDEN
                )
            boutique = user.boutique_profil

        # Vérification du plan
        plan_id = request.data.get("plan")
        if not plan_id:
            return Response({"detail": "Plan requis."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan introuvable."}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier s’il existe déjà un abonnement non expiré
        non_expired_sub = Subscription.objects.filter(
            boutique=boutique
        ).exclude(
            status=Subscription.STATUS_EXPIRED
        ).first()

        if non_expired_sub:
            # Vérifier si l'abonnement est encore actif
            if non_expired_sub.is_active():
                if non_expired_sub.plan.name.lower() == "gratuit":
                    # Gratuit actif → autorisé uniquement si le nouveau est payant
                    if plan.name.lower() == "gratuit":
                        return Response(
                            {"detail": "L'abonnement gratuit n'est utilisable qu'une seule fois."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    # 🔒 Abonnement payant actif → interdit
                    return Response(
                        {"detail": "Un abonnement payant est déjà actif pour cette boutique. "
                                   "Attendez la fin de l'abonnement avant d'en souscrire un autre."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # Abonnement en transition
                return Response(
                    {"detail": "Un abonnement est en cours de traitement. Attendez qu’il expire."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Vérifier si le plan gratuit a déjà été utilisé dans le passé
        if plan.name.lower() == "gratuit":
            if Subscription.objects.filter(
                boutique=boutique,
                plan__name__iexact="gratuit"
            ).exists():
                return Response(
                    {"detail": "L'abonnement gratuit n'est utilisable qu'une seule fois."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # ✅ Création de la nouvelle souscription
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(boutique=boutique, plan=plan)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ✅ L’admin seul peut supprimer une souscription
    def destroy(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()

        if not (user.is_superuser or getattr(user, "role", None) == "admin"):
            return Response(
                {"detail": "Seul l’administrateur peut supprimer un abonnement."},
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_destroy(instance)
        return Response({"detail": "Abonnement supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)

    # (Optionnel) filtrage automatique selon l’utilisateur
    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if getattr(user, "role", None) == "boutique" and hasattr(user, "boutique_profil"):
            return qs.filter(boutique=user.boutique_profil)
        return qs



@api_view(["POST"])
@permission_classes([])
@authentication_classes([])
def cookie_refresh(request):
    """
    Rafraîchir le token d'accès avec gestion d'erreur améliorée
    """
    refresh_token = request.COOKIES.get("refresh_token")
    
    if not refresh_token:
        return Response(
            {"detail": "Refresh token not found in cookies."}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        # Vérifier si le token est valide
        refresh = RefreshToken(refresh_token)
        
        # NE PAS vérifier manuellement l'expiration - TokenError le fera automatiquement
        # Lorsque vous accédez à access_token, il vérifie automatiquement l'expiration
        
        data = {"access": str(refresh.access_token)}
        return Response(data, status=status.HTTP_200_OK)
        
    except TokenError as e:
        print(f"TokenError during refresh: {str(e)}")  # Debug
        return Response(
            {"detail": "Invalid or expired refresh token."}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        print(f"Unexpected error during refresh: {str(e)}")  # Debug
        return Response(
            {"detail": "Unexpected error during token refresh."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    response = Response({"detail": "Déconnecté avec succès"})
    # Supprimer le cookie refresh_token (httpOnly)
    response.delete_cookie("refresh_token", samesite="Lax")
    return response