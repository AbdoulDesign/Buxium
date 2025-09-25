from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
import csv
import io
import pandas as pd
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from rest_framework.views import APIView
from django.db.models import Sum, F, DecimalField, Count
from .models import Categorie, Marchandise, Entree, Sortie, Fournisseur, Transaction
from .serializers import (
    CategorieSerializer, MarchandiseSerializer, EntreeSerializer,
    SortieSerializer, FournisseurSerializer, TransactionSerializer,
    EntreeLightSerializer, SortieLightSerializer, TransactionSimpleSerializer
)
from django.utils import timezone
from rest_framework import status
from datetime import timedelta
import calendar
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
import datetime
from django.db.models.functions import ExtractWeekDay
from accounts.permissions import IsAdmin, IsBoutique, IsPersonnel
from accounts.models import Boutique
from rest_framework import serializers
from core.mixins import MultiTenantMixin
from utils.tenants import filter_by_tenant



class MarchandiseViewSet(MultiTenantMixin, viewsets.ModelViewSet):
    queryset = Marchandise.objects.all().order_by("-created_at")
    serializer_class = MarchandiseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "boutique":
            serializer.save(boutique=user.boutique_profil)
        elif user.role == "personnel":
            serializer.save(boutique=user.personnel_profil.boutique)
        else:
            raise PermissionDenied("Vous ne pouvez pas créer de marchandise.")


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Vérifie si le paramètre ?hard=true est passé
        if request.query_params.get("hard") == "true":
            instance.delete()  # suppression définitive
            return Response(
                {"message": f"Marchandise {instance.name} supprimée définitivement"},
                status=status.HTTP_204_NO_CONTENT,
            )

        # Sinon soft delete
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Marchandise {instance.name} désactivée"},
            status=status.HTTP_204_NO_CONTENT,
        )

    
    @action(detail=True, methods=["post"], url_path="restore")
    def restore(self, request, pk=None):
        """Réactive une marchandise désactivée (soft restore)."""
        try:
            instance = Marchandise.objects.get(pk=pk, is_active=False)
        except Marchandise.DoesNotExist:
            return Response(
                {"error": "Cette marchandise n'existe pas ou est déjà active."},
                status=status.HTTP_404_NOT_FOUND,
            )

        instance.is_active = True
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Marchandise '{instance.name}' restaurée"},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="archived")
    def archived(self, request):
        """Retourne la liste des marchandises désactivées (archivées)."""
        archived_items = Marchandise.objects.filter(is_active=False)
        serializer = self.get_serializer(archived_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # -------- EXPORT CSV --------
    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="marchandises.csv"'

        writer = csv.writer(response)
        writer.writerow(["ID", "Référence", "Désignation", "Unité", "Seuil", "Stock", "Prix", "Catégorie"])
        for m in self.get_queryset():
            writer.writerow([
                m.id, m.reference, m.name, m.unite,
                m.seuil, m.stock, m.prix_vente,
                m.categorie.name if m.categorie else ""
            ])
        return response

    # -------- EXPORT EXCEL --------
    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        marchandises = self.get_queryset().values(
            "id", "reference", "name", "unite", "seuil", "stock", "prix de vente", "categorie__name"
        )
        df = pd.DataFrame(list(marchandises))
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, sheet_name="Marchandises", index=False)

        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = 'attachment; filename="marchandises.xlsx"'
        return response

    # -------- EXPORT PDF --------
    @action(detail=False, methods=["get"])
    def export_pdf(self, request):
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="marchandises.pdf"'

        p = canvas.Canvas(response)
        p.setFont("Helvetica-Bold", 14)
        p.drawString(100, 800, "Liste des Marchandises")

        y = 760
        for m in self.get_queryset():
            line = f"{m.reference} - {m.name} | Stock: {m.stock} | Prix de vente: {m.prix_vente} CFA"
            p.setFont("Helvetica", 10)
            p.drawString(50, y, line)
            y -= 20
            if y < 50: 
                p.showPage()
                y = 800

        p.showPage()
        p.save()
        return response


# --------- Entree ----------
class EntreeViewSet(MultiTenantMixin, viewsets.ModelViewSet):
    queryset = Entree.objects.all().order_by("-created_at")
    serializer_class = EntreeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        marchandise = serializer.validated_data["marchandise"]

        # 🚨 Vérification de cohérence boutique
        boutique = None
        if user.role == "boutique":
            boutique = user.boutique_profil
        elif user.role == "personnel" and hasattr(user, "personnel_profil"):
            boutique = user.personnel_profil.boutique

        if boutique and marchandise.boutique != boutique:
            raise serializers.ValidationError(
                "Vous ne pouvez pas ajouter une entrée pour une marchandise d'une autre boutique ❌."
            )

        quantite = serializer.validated_data["quantite"]

        serializer.save(
            boutique=marchandise.boutique,   # ✅ ici on fixe la boutique
            name=marchandise.name,
            prix_unitaire=marchandise.prix_achat,
            total=quantite * marchandise.prix_achat,
            created_at=timezone.now(),
        )



    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="entrees.csv"'
        writer = csv.writer(response)
        writer.writerow(["ID", "Marchandise", "Quantité"])
        for e in self.get_queryset():
            writer.writerow([e.id, e.marchandise.name, e.quantite])
        return response

    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        df = pd.DataFrame(list(self.get_queryset().values("id", "marchandise__name", "quantite")))
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Entrees")
        buffer.seek(0)
        response = HttpResponse(buffer, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = 'attachment; filename="entrees.xlsx"'
        return response

    @action(detail=False, methods=["get"])
    def export_pdf(self, request):
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="entrees.pdf"'
        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter
        y = height - 50
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "Liste des Entrées")
        p.setFont("Helvetica", 12)
        y -= 30
        for e in self.get_queryset():
            line = f"ID: {e.id} | Marchandise: {e.marchandise.name} | Quantité: {e.quantite}"
            p.drawString(50, y, line)
            y -= 20
            if y < 50:
                p.showPage()
                y = height - 50
        p.save()
        return response

# --------- Sortie ----------
class SortieViewSet(MultiTenantMixin, viewsets.ModelViewSet):
    queryset = Sortie.objects.filter(marchandise__is_active=True).order_by("-created_at")
    serializer_class = SortieSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        marchandise = serializer.validated_data["marchandise"]

        # 🚨 Vérification de cohérence boutique
        boutique = None
        if user.role == "boutique":
            boutique = user.boutique_profil
        elif user.role == "personnel" and hasattr(user, "personnel_profil"):
            boutique = user.personnel_profil.boutique

        if boutique and marchandise.boutique != boutique:
            raise serializers.ValidationError(
                "Vous ne pouvez pas ajouter une sortie pour une marchandise d'une autre boutique ❌."
            )

        quantite = serializer.validated_data["quantite"]

        serializer.save(
            boutique=marchandise.boutique,   # ✅ ici aussi
            name=marchandise.name,
            prix_unitaire=marchandise.prix_vente,
            total=quantite * marchandise.prix_vente,
            created_at=timezone.now(),
        )


    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="sorties.csv"'
        writer = csv.writer(response)
        writer.writerow(["ID", "Marchandise", "Quantité"])
        for s in self.get_queryset():
            writer.writerow([s.id, s.marchandise.name, s.quantite])
        return response

    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        df = pd.DataFrame(list(self.get_queryset().values("id", "marchandise__name", "quantite")))
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Sorties")
        buffer.seek(0)
        response = HttpResponse(buffer, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = 'attachment; filename="sorties.xlsx"'
        return response

    @action(detail=False, methods=["get"])
    def export_pdf(self, request):
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="sorties.pdf"'
        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter
        y = height - 50
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "Liste des Sorties")
        p.setFont("Helvetica", 12)
        y -= 30
        for s in self.get_queryset():
            line = f"ID: {s.id} | Marchandise: {s.marchandise.name} | Quantité: {s.quantite}"
            p.drawString(50, y, line)
            y -= 20
            if y < 50:
                p.showPage()
                y = height - 50
        p.save()
        return response


class CategorieViewSet(MultiTenantMixin, viewsets.ModelViewSet):
    queryset = Categorie.objects.all().order_by("-created_at")
    serializer_class = CategorieSerializer
    permission_classes = [IsAuthenticated]



class InventaireExportView(MultiTenantMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get_inventaire_data(self, user):
        data = []

        for m in marchandises:
            total_entrees = Entree.objects.filter(marchandise=m).aggregate(Sum("quantite"))["quantite__sum"] or 0
            total_sorties = Sortie.objects.filter(marchandise=m).aggregate(Sum("quantite"))["quantite__sum"] or 0

            stock_initial = m.stock or 0
            stock_final = stock_initial + total_entrees - total_sorties
            cump = getattr(m, "prix_achat", 0)  # ⚡ attention: j’ai remplacé m.prix par prix_achat
            valeur = stock_final * cump

            data.append({
                "Référence": m.reference,
                "Nom": m.name,
                "Catégorie": m.categorie.label if m.categorie else "",
                "Unité": m.unite,
                "Seuil": m.seuil,
                "Stock Initial": stock_initial,
                "Entrées": total_entrees,
                "Sorties": total_sorties,
                "Stock Final": stock_final,
                "CUMP": cump,
                "Valeur": valeur,
            })

        return data

    def get(self, request, format=None):
        export_type = request.query_params.get("type", "csv")  # ?type=csv|excel|pdf
        data = self.get_inventaire_data(request.user)

        if not data:
            return Response({"message": "Aucune marchandise trouvée."}, status=404)

        if export_type == "csv":
            response = HttpResponse(content_type="text/csv")
            response["Content-Disposition"] = 'attachment; filename="inventaire.csv"'
            writer = csv.DictWriter(response, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
            return response

        elif export_type == "excel":
            df = pd.DataFrame(data)
            buffer = io.BytesIO()
            with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
                df.to_excel(writer, sheet_name="Inventaire", index=False)
            buffer.seek(0)
            response = HttpResponse(
                buffer,
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            response["Content-Disposition"] = 'attachment; filename="inventaire.xlsx"'
            return response

        elif export_type == "pdf":
            response = HttpResponse(content_type="application/pdf")
            response["Content-Disposition"] = 'attachment; filename="inventaire.pdf"'
            p = canvas.Canvas(response, pagesize=letter)
            width, height = letter
            y = height - 50
            p.setFont("Helvetica-Bold", 14)
            p.drawString(200, y, "Inventaire des Marchandises")
            y -= 40
            p.setFont("Helvetica", 10)

            for row in data:
                line = f"{row['Référence']} - {row['Désignation']} | Stock: {row['Stock Final']} | Valeur: {row['Valeur']} CFA"
                p.drawString(50, y, line)
                y -= 15
                if y < 50:
                    p.showPage()
                    y = height - 50

            p.save()
            return response

        return Response({"error": "Format non supporté"}, status=400)


class FournisseurViewSet(MultiTenantMixin, viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all().order_by("-created_at")
    serializer_class = FournisseurSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Si ?hard=true alors suppression définitive
        if request.query_params.get("hard") == "true":
            instance.delete()
            return Response(
                {"message": f"Fournisseur #{instance.id} supprimée définitivement"},
                status=status.HTTP_204_NO_CONTENT,
            )

        # Sinon soft delete
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Fournisseur #{instance.id} désactivée"},
            status=status.HTTP_204_NO_CONTENT,
        )


    @action(detail=False, methods=["get"], url_path="archived")
    def archived(self, request):
        archived_items = Fournisseur.objects.filter(is_active=False)
        serializer = self.get_serializer(archived_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="restore")
    def restore(self, request, pk=None):
        try:
            instance = Fournisseur.objects.get(pk=pk, is_active=False)
        except Fournisseur.DoesNotExist:
            return Response(
                {"error": "Cette fournisseur n'existe pas ou est déjà active."},
                status=status.HTTP_404_NOT_FOUND,
            )

        instance.is_active = True
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Fournisseur #{instance.id} restaurée"},
            status=status.HTTP_200_OK,
        )


class TransactionViewSet(MultiTenantMixin, viewsets.ModelViewSet):
    queryset = Transaction.objects.filter(is_active=True).select_related("boutique").order_by("-created_at")
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]


    # Soft delete
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Hard delete si ?hard=true
        if request.query_params.get("hard") == "true":
            instance.delete()
            return Response(
                {"message": f"Transaction #{instance.id} supprimée définitivement"},
                status=status.HTTP_204_NO_CONTENT,
            )

        # Soft delete sinon
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Transaction #{instance.id} désactivée"},
            status=status.HTTP_204_NO_CONTENT,
        )


    # Voir les transactions archivées
    @action(detail=False, methods=["get"], url_path="archived")
    def archived(self, request):
        archived_items = Transaction.objects.filter(is_active=False)
        serializer = self.get_serializer(archived_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Restaurer une transaction
    @action(detail=True, methods=["post"], url_path="restore")
    def restore(self, request, pk=None):
        try:
            instance = Transaction.objects.get(pk=pk, is_active=False)
        except Transaction.DoesNotExist:
            return Response(
                {"error": "Cette transaction n'existe pas ou est déjà active."},
                status=status.HTTP_404_NOT_FOUND,
            )

        instance.is_active = True
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Transaction #{instance.id} restaurée"},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def finance_view(request):
    user = request.user

    # Appliquer le filtrage tenant-aware
    entrees = filter_by_tenant(Entree.objects.all(), user)
    sorties = filter_by_tenant(Sortie.objects.all(), user)
    trans_revenus = filter_by_tenant(Transaction.objects.filter(type="revenu"), user)
    trans_depenses = filter_by_tenant(Transaction.objects.filter(type="depense"), user)

    # Optionnel : Admin peut cibler une boutique via ?boutique=ID
    if user.role == "admin":
        boutique_id = request.query_params.get("boutique")
        if boutique_id:
            entrees = entrees.filter(marchandise__boutique_id=boutique_id)
            sorties = sorties.filter(marchandise__boutique_id=boutique_id)
            trans_revenus = trans_revenus.filter(boutique_id=boutique_id)
            trans_depenses = trans_depenses.filter(boutique_id=boutique_id)

    return Response({
        "details": {
            "entrees": EntreeLightSerializer(entrees, many=True).data,
            "sorties": SortieLightSerializer(sorties, many=True).data,
            "transactions_revenus": TransactionSimpleSerializer(trans_revenus, many=True).data,
            "transactions_depenses": TransactionSimpleSerializer(trans_depenses, many=True).data,
        }
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    user = request.user
    boutique_id = request.query_params.get("boutique")

    today = timezone.now().date()
    start_week = today - timedelta(days=today.weekday())
    end_week = start_week + timedelta(days=6)

    # --- QuerySets filtrés tenant-aware ---
    transactions = filter_by_tenant(Transaction.objects.all(), user)
    entrees = filter_by_tenant(Entree.objects.all(), user)
    sorties = filter_by_tenant(Sortie.objects.all(), user)
    marchandises = filter_by_tenant(Marchandise.objects.filter(is_active=True), user)

    # --- Si admin + param boutique ---
    if user.role == "admin" and boutique_id:
        transactions = transactions.filter(boutique_id=boutique_id)
        entrees = entrees.filter(marchandise__boutique_id=boutique_id)
        sorties = sorties.filter(marchandise__boutique_id=boutique_id)
        marchandises = marchandises.filter(boutique_id=boutique_id)

    # --- Stats du jour ---
    revenu_du_jour = (
        transactions.filter(type="revenu", created_at__date=today).aggregate(total=Sum("montant"))["total"] or 0
    ) + (sorties.filter(created_at__date=today).aggregate(total=Sum("total"))["total"] or 0)

    depense_du_jour = (
        transactions.filter(type="depense", created_at__date=today).aggregate(total=Sum("montant"))["total"] or 0
    ) + (entrees.filter(created_at__date=today).aggregate(total=Sum("total"))["total"] or 0)

    entrees_du_jour = entrees.filter(created_at__date=today).count()
    sorties_du_jour = sorties.filter(created_at__date=today).count()
    stock_alerte = marchandises.filter(stock__lte=F("seuil")).count()

    # --- Graphiques hebdo ---
    jours_fr = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

    entrees_week = (
        entrees.filter(created_at__date__range=[start_week, end_week])
        .annotate(day=ExtractWeekDay("created_at"))
        .values("day")
        .annotate(total=Count("id"))
    )
    graph_entrees = {j: 0 for j in jours_fr}
    for e in entrees_week:
        day_index = (e["day"] - 2) % 7
        graph_entrees[jours_fr[day_index]] = e["total"]

    sorties_week = (
        sorties.filter(created_at__date__range=[start_week, end_week])
        .annotate(day=ExtractWeekDay("created_at"))
        .values("day")
        .annotate(total=Count("id"))
    )
    graph_sorties = {j: 0 for j in jours_fr}
    for s in sorties_week:
        day_index = (s["day"] - 2) % 7
        graph_sorties[jours_fr[day_index]] = s["total"]

    # --- Réponse ---
    data = {
        "stats": {
            "revenu_du_jour": revenu_du_jour,
            "depense_du_jour": depense_du_jour,
            "entrees_du_jour": entrees_du_jour,
            "sorties_du_jour": sorties_du_jour,
            "stock_alerte": stock_alerte,
        },
        "graphique_entrees": graph_entrees,
        "graphique_sorties": graph_sorties,
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rapport_stock(request):
    user = request.user
    boutique_id = request.query_params.get("boutique")

    # --- Base QuerySets filtrés par tenant ---
    marchandises = filter_by_tenant(Marchandise.objects.all(), user)
    entrees = filter_by_tenant(Entree.objects.all(), user)
    sorties = filter_by_tenant(Sortie.objects.all(), user)

    # --- Cas particulier : admin qui force un boutique_id ---
    if user.role == "admin" and boutique_id:
        marchandises = marchandises.filter(boutique_id=boutique_id)
        entrees = entrees.filter(marchandise__boutique_id=boutique_id)
        sorties = sorties.filter(marchandise__boutique_id=boutique_id)

    # --- Stats Marchandises ---
    total_marchandise = marchandises.count()

    valeur_marchandise = marchandises.aggregate(
        total=Sum(F('stock') * F('prix_vente'))
    )['total'] or 0

    marchandise_alertes = marchandises.filter(stock__lte=F('seuil')).count()

    total_stock = marchandises.aggregate(total_stock=Sum('stock'))['total_stock'] or 0
    stock_moyen = total_stock / total_marchandise if total_marchandise else 0

    marchandise_par_mois = {
        datetime.date(2000, month, 1).strftime('%b'): marchandises.filter(
            created_at__month=month
        ).count()
        for month in range(1, 13)
    }

    # --- Stats Entrées ---
    article_en_entree = entrees.count()
    valeur_entree = entrees.aggregate(total=Sum('total'))['total'] or 0
    quantite_total_entree = entrees.aggregate(total=Sum('quantite'))['total'] or 0

    entree_par_mois = {
        datetime.date(2000, month, 1).strftime('%b'): entrees.filter(
            created_at__month=month
        ).aggregate(total=Sum('quantite'))['total'] or 0
        for month in range(1, 13)
    }

    today = timezone.now().date()
    current_month = today.month
    previous_month = (today.replace(day=1) - timedelta(days=1)).month

    quantite_mois_courant = entrees.filter(created_at__month=current_month).aggregate(
        total=Sum('quantite')
    )['total'] or 0

    quantite_mois_precedent = entrees.filter(created_at__month=previous_month).aggregate(
        total=Sum('quantite')
    )['total'] or 0

    variation_mensuelle_entree = 0
    if quantite_mois_precedent > 0:
        variation_mensuelle_entree = (
            (quantite_mois_courant - quantite_mois_precedent) / quantite_mois_precedent
        ) * 100

    # --- Stats Sorties ---
    article_en_sortie = sorties.count()
    quantite_sortie = sorties.aggregate(total=Sum('quantite'))['total'] or 0
    valeur_sortie = sorties.aggregate(total=Sum('total'))['total'] or 0

    article_le_plus_sortie_obj = sorties.values('name').annotate(
        qte=Sum('quantite')
    ).order_by('-qte').first()
    article_le_plus_sortie = article_le_plus_sortie_obj['name'] if article_le_plus_sortie_obj else None

    sortie_par_mois = {
        datetime.date(2000, month, 1).strftime('%b'): sorties.filter(
            created_at__month=month
        ).aggregate(total=Sum('quantite'))['total'] or 0
        for month in range(1, 13)
    }

    # --- Assemblage des données ---
    data = {
        "marchandise": {
            "total_marchandise": total_marchandise,
            "valeur_marchandise": valeur_marchandise,
            "marchandise_alertes": marchandise_alertes,
            "stock_moyen": stock_moyen,
            "marchandiseParMois": marchandise_par_mois
        },
        "entree": {
            "ArticleEnEntree": article_en_entree,
            "ValeurEntree": valeur_entree,
            "QuantiteTotal": quantite_total_entree,
            "entreeParMois": entree_par_mois,
            "VariationMois": round(variation_mensuelle_entree, 2)
        },
        "sortie": {
            "ArticleEnSortie": article_en_sortie,
            "QuantiteSortie": quantite_sortie,
            "ArticleLePlusSortie": article_le_plus_sortie,
            "TotalValeur": valeur_sortie,
            "sortieParMois": sortie_par_mois
        }
    }

    return Response(data)