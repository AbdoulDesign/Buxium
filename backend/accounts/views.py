from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Entreprise, Utilisateur, Activite, Role, Plan, Subscription, Payment
from .serializers import (
    EntrepriseRegisterSerializer,
    UtilisateurRegisterSerializer,
    LoginSerializer, ActiviteSerializer, RoleSerializer,
    SetNewPasswordSerializer, PlanSerializer, SubscriptionSerializer, PaymentSerializer
)
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.conf import settings
from django.utils import timezone
from datetime import timedelta 
from rest_framework import permissions


class ActiviteViewSet(viewsets.ModelViewSet):
    queryset = Activite.objects.all()
    serializer_class = ActiviteSerializer
    permission_classes = [AllowAny]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = []


class EntrepriseViewSet(viewsets.ModelViewSet):
    queryset = Entreprise.objects.all()
    serializer_class = EntrepriseRegisterSerializer
    permission_classes = []

    def get_permissions(self):
        if self.action == 'create':  # POST
            return [AllowAny()]
        return [AllowAny()]  # GET, DELETE, PUT, PATCH nécessitent auth (je dois remettre 'IsAuthenticated', mais ca aussi je vais devoir enlever apres)

    def get_queryset(self):
        return self.queryset.filter(is_active=True)


    def destroy(self, request, *args, **kwargs):
        """
        Soft delete : désactive l'entreprise par défaut.
        Hard delete : suppression définitive si ?hard=true.
        """
        instance = self.get_object()

        # Hard delete si ?hard=true
        if request.query_params.get("hard") == "true":
            instance.delete()
            return Response(
                {"message": f"Entreprise '{instance.username}' supprimée définitivement"},
                status=status.HTTP_204_NO_CONTENT,
            )

        # Soft delete sinon
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Entreprise '{instance.username}' désactivée"},
            status=status.HTTP_204_NO_CONTENT,
        )


    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        """Réactive une entreprise désactivée"""
        try:
            instance = Entreprise.objects.get(pk=pk, is_active=False)
        except Entreprise.DoesNotExist:
            return Response(
                {"error": "Cette entreprise n'existe pas ou est déjà active."},
                status=status.HTTP_404_NOT_FOUND,
            )
        instance.is_active = True
        instance.save(update_fields=["is_active"])
        return Response({"message": f"Entreprise '{instance.username}' restaurée"})


    @action(detail=False, methods=["get"])
    def archived(self, request):
        """Liste des entreprises désactivées"""
        archived_items = Entreprise.objects.filter(is_active=False)
        serializer = self.get_serializer(archived_items, many=True)
        return Response(serializer.data)


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def set_password(self, request, pk=None):
        entreprise = self.get_object()
        serializer = SetNewPasswordSerializer(
            data=request.data,
            context={'user': entreprise}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Mot de passe changé avec succès."},
            status=status.HTTP_200_OK
        )


class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurRegisterSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return self.queryset.filter(is_active=True)
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Hard delete si ?hard=true
        if request.query_params.get("hard") == "true":
            instance.delete()
            return Response(
                {"message": f"Utilisateur '{instance.username}' supprimée définitivement"},
                status=status.HTTP_204_NO_CONTENT,
            )
            
            # Soft delete sinon
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Utilisateur '{instance.username}' désactivé"},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        try:
            instance = Utilisateur.objects.get(pk=pk, is_active=False)
        except Utilisateur.DoesNotExist:
            return Response(
                {"error": "Cet utilisateur n'existe pas ou est déjà actif."},
                status=status.HTTP_404_NOT_FOUND,
            )
        instance.is_active = True
        instance.save(update_fields=["is_active"])
        return Response({"message": f"Utilisateur '{instance.username}' restauré"})


    @action(detail=False, methods=["get"])
    def archived(self, request):
        archived_items = Utilisateur.objects.filter(is_active=False)
        serializer = self.get_serializer(archived_items, many=True)
        return Response(serializer.data)
    

    @action(detail=True, methods=['post'], permission_classes=[])
    def set_password(self, request, pk=None):
        utilisateur = self.get_object()
        serializer = SetNewPasswordSerializer(
            data=request.data,
            context={'user': utilisateur}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Mot de passe changé avec succès."},
            status=status.HTTP_200_OK
        )



# --- Login commun (Entreprise ou Utilisateur) ---
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        # --- Vérifie si c’est une entreprise ---
        entreprise = Entreprise.objects.filter(username=username, is_active=True).first()
        if entreprise and entreprise.check_password(password):
            # Création d'un refresh token "custom" pour l'entreprise
            refresh = RefreshToken()
            refresh["type"] = "entreprise"
            refresh["entreprise_id"] = entreprise.id
            refresh["username"] = entreprise.username

            access = refresh.access_token
            activite_data = ActiviteSerializer(entreprise.activite).data if entreprise.activite else None

            return Response({
                "id": entreprise.id,
                "username": entreprise.username,
                "nom": entreprise.nom,
                "type": "entreprise",
                "activite": activite_data,
                "refresh": str(refresh),
                "access": str(access),
            }, status=status.HTTP_200_OK)

        # --- Vérifie si c’est un utilisateur ---
        user = Utilisateur.objects.filter(username=username, is_active=True).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            role_data = RoleSerializer(user.role).data if user.role else None

            return Response({
                "id": user.id,
                "username": user.username,
                "nom": user.nom,
                "role": role_data,
                "entreprise": user.entreprise.id if user.entreprise else None,
                "type": "utilisateur",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_200_OK)

        return Response({"detail": "Identifiants invalides"}, status=status.HTTP_401_UNAUTHORIZED)


# --- Endpoint /refresh/ ---
class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token manquant"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            new_access = refresh.access_token
            return Response({"access": str(new_access)}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"detail": "Refresh token invalide ou expiré"}, status=status.HTTP_401_UNAUTHORIZED)


class CurrencyView(APIView):
    permission_classes = []

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
    permission_classes = []


# -------- Abonnement --------
class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = []

    @action(detail=False, methods=["get"])
    def my_subscription(self, request):
        """Retourne l’abonnement de l’entreprise connectée"""
        entreprise = request.user  # car Entreprise est ton AUTH_USER_MODEL
        subscription = Subscription.objects.filter(entreprise=entreprise).first()
        if not subscription:
            return Response({"detail": "Pas d’abonnement actif"}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)


# -------- Paiements --------
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        """
        Lorsqu’un paiement est effectué :
        - Enregistre le paiement
        - Met à jour ou crée l’abonnement
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()

        # Mettre à jour l’abonnement
        plan = payment.plan
        entreprise = payment.entreprise
        subscription, created = Subscription.objects.get_or_create(entreprise=entreprise)

        subscription.plan = plan
        subscription.start_date = timezone.now()
        subscription.end_date = subscription.start_date + timedelta(days=plan.duration_days)
        subscription.is_active = True
        subscription.save()

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "payment": PaymentSerializer(payment).data,
                "subscription": SubscriptionSerializer(subscription).data,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )
