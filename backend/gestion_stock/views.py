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
from accounts.permissions import HasActiveSubscription
from django.db.models.functions import ExtractWeekDay




class MarchandiseViewSet(viewsets.ModelViewSet):
    queryset = Marchandise.objects.filter(is_active=True)  # on ne retourne que les actifs
    serializer_class = MarchandiseSerializer
    permission_classes = []

    def get_queryset(self):
        qs = Marchandise.objects.filter(is_active=True).select_related("categorie", "entreprise")

        entreprise_id = self.request.query_params.get("entreprise")
        if entreprise_id:
            qs = qs.filter(entreprise_id=entreprise_id)

        return qs


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Vérifie si le paramètre ?hard=true est passé
        if request.query_params.get("hard") == "true":
            instance.delete()  # suppression définitive
            return Response(
                {"message": f"Marchandise {instance.designation} supprimée définitivement"},
                status=status.HTTP_204_NO_CONTENT,
            )

        # Sinon soft delete
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Marchandise {instance.designation} désactivée"},
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
            {"message": f"Marchandise '{instance.designation}' restaurée"},
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
                m.id, m.reference, m.designation, m.unite,
                m.seuil, m.stock, m.prix,
                m.categorie.nom if m.categorie else ""
            ])
        return response

    # -------- EXPORT EXCEL --------
    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        marchandises = self.get_queryset().values(
            "id", "reference", "designation", "unite", "seuil", "stock", "prix", "categorie__nom"
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
            line = f"{m.reference} - {m.designation} | Stock: {m.stock} | Prix: {m.prix} CFA"
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
class EntreeViewSet(viewsets.ModelViewSet):
    queryset = Entree.objects.filter(marchandise__is_active=True)
    serializer_class = EntreeSerializer
    permission_classes = []


    def perform_create(self, serializer):
        marchandise = serializer.validated_data["marchandise"]
        quantite = serializer.validated_data["quantite"]

        # Snapshot
        serializer.save(
            designation=marchandise.designation,
            prix_unitaire=marchandise.prix_achat,
            total=quantite * marchandise.prix_achat,
            created_at=timezone.now(),
        )

    def get_queryset(self):
        qs = Entree.objects.filter(marchandise__is_active=True).select_related(
            "marchandise__categorie", "marchandise__entreprise"
        )
        entreprise_id = self.request.query_params.get("entreprise")
        if entreprise_id:
            try:
                entreprise_id = int(entreprise_id)
                qs = qs.filter(marchandise__entreprise_id=entreprise_id)
            except ValueError:
                return qs.none()
        return qs


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Vérifie si le paramètre ?hard=true est passé
        if request.query_params.get("hard") == "true":
            instance.delete()  # suppression définitive
            return Response(
                {"message": f"Entrée #{instance.id} supprimée définitivement"},
                status=status.HTTP_204_NO_CONTENT,
            )

        # Sinon soft delete
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Entrée #{instance.id} désactivée"},
            status=status.HTTP_204_NO_CONTENT,
        )



    @action(detail=False, methods=["get"], url_path="archived")
    def archived(self, request):
        archived_items = Entree.objects.filter(marchandise__is_active=False)
        serializer = self.get_serializer(archived_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="restore")
    def restore(self, request, pk=None):
        try:
            instance = Entree.objects.get(pk=pk, marchandise__is_active=False)
        except Entree.DoesNotExist:
            return Response(
                {"error": "Cette entrée n'existe pas ou est déjà active."},
                status=status.HTTP_404_NOT_FOUND,
            )

        instance.is_active = True
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Entrée #{instance.id} restaurée"},
            status=status.HTTP_200_OK,
        )


    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="entrees.csv"'
        writer = csv.writer(response)
        writer.writerow(["ID", "Marchandise", "Quantité"])
        for e in self.get_queryset():
            writer.writerow([e.id, e.marchandise.designation, e.quantite])
        return response

    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        df = pd.DataFrame(list(self.get_queryset().values("id", "marchandise__designation", "quantite")))
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
            line = f"ID: {e.id} | Marchandise: {e.marchandise.designation} | Quantité: {e.quantite}"
            p.drawString(50, y, line)
            y -= 20
            if y < 50:
                p.showPage()
                y = height - 50
        p.save()
        return response

# --------- Sortie ----------
class SortieViewSet(viewsets.ModelViewSet):
    queryset = Sortie.objects.filter(marchandise__is_active=True)
    serializer_class = SortieSerializer
    permission_classes = []


    def perform_create(self, serializer):
        marchandise = serializer.validated_data["marchandise"]
        quantite = serializer.validated_data["quantite"]

        try:
            # Snapshot
            serializer.save(
                designation=marchandise.designation,
                prix_unitaire=marchandise.prix_vente,
                total=quantite * marchandise.prix_vente,
                created_at=timezone.now(),
            )
        except ValueError as e:
            # Transforme ton ValueError en ValidationError REST
            raise ValidationError({"detail": str(e)})


    def get_queryset(self):
        qs = Sortie.objects.filter(marchandise__is_active=True).select_related(
            "marchandise__categorie", "marchandise__entreprise"
        )
        entreprise_id = self.request.query_params.get("entreprise")
        if entreprise_id:
            try:
                entreprise_id = int(entreprise_id)
                qs = qs.filter(marchandise__entreprise_id=entreprise_id)
            except ValueError:
                return qs.none()
        return qs


    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Si ?hard=true alors suppression définitive
        if request.query_params.get("hard") == "true":
            instance.delete()
            return Response(
                {"message": f"Sortie #{instance.id} supprimée définitivement"},
                status=status.HTTP_204_NO_CONTENT,
            )

        # Sinon soft delete
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Sortie #{instance.id} désactivée"},
            status=status.HTTP_204_NO_CONTENT,
        )


    @action(detail=False, methods=["get"], url_path="archived")
    def archived(self, request):
        archived_items = Sortie.objects.filter(marchandise__is_active=False)
        serializer = self.get_serializer(archived_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="restore")
    def restore(self, request, pk=None):
        try:
            instance = Sortie.objects.get(pk=pk, marchandise__is_active=False)
        except Sortie.DoesNotExist:
            return Response(
                {"error": "Cette sortie n'existe pas ou est déjà active."},
                status=status.HTTP_404_NOT_FOUND,
            )

        instance.is_active = True
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": f"Sortie #{instance.id} restaurée"},
            status=status.HTTP_200_OK,
        )


    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="sorties.csv"'
        writer = csv.writer(response)
        writer.writerow(["ID", "Marchandise", "Quantité"])
        for s in self.get_queryset():
            writer.writerow([s.id, s.marchandise.designation, s.quantite])
        return response

    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        df = pd.DataFrame(list(self.get_queryset().values("id", "marchandise__designation", "quantite")))
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
            line = f"ID: {s.id} | Marchandise: {s.marchandise.designation} | Quantité: {s.quantite}"
            p.drawString(50, y, line)
            y -= 20
            if y < 50:
                p.showPage()
                y = height - 50
        p.save()
        return response


class CategorieViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les catégories avec filtrage par entreprise.
    """
    serializer_class = CategorieSerializer
    permission_classes = [AllowAny]  # ou tes permissions personnalisées

    def get_queryset(self):
        queryset = Categorie.objects.all()
        entreprise_id = self.request.query_params.get("entreprise")
        if entreprise_id:
            queryset = queryset.filter(entreprise_id=entreprise_id)
        return queryset



class InventaireExportView(APIView):
    """
    Vue pour exporter l'inventaire complet (stock final, CUMP, valeur)
    en CSV, Excel ou PDF.
    """
    permission_classes = []

    def get_inventaire_data(self):
        marchandises = Marchandise.objects.all()
        data = []

        for m in marchandises:
            total_entrees = Entree.objects.filter(marchandise=m).aggregate(Sum("quantite"))["quantite__sum"] or 0
            total_sorties = Sortie.objects.filter(marchandise=m).aggregate(Sum("quantite"))["quantite__sum"] or 0

            stock_initial = m.stock or 0
            stock_final = stock_initial + total_entrees - total_sorties
            cump = m.prix or 0
            valeur = stock_final * cump

            data.append({
                "Référence": m.reference,
                "Désignation": m.designation,
                "Catégorie": m.categorie.nom if m.categorie else "",
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
        data = self.get_inventaire_data()

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


class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = []

    def get_queryset(self):
        qs = Fournisseur.objects.all().prefetch_related("marchandises")
        entreprise_id = self.request.query_params.get("entreprise")
        if entreprise_id:
            try:
                # On filtre via les marchandises liées à cette entreprise
                qs = qs.filter(marchandises__entreprise_id=int(entreprise_id)).distinct()
            except ValueError:
                return qs.none()
        return qs


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.filter(is_active=True).select_related("entreprise")
    serializer_class = TransactionSerializer
    permission_classes = []

    def get_queryset(self):
        qs = Transaction.objects.filter(is_active=True).select_related("entreprise")

        entreprise_id = self.request.query_params.get("entreprise")
        if entreprise_id:
            qs = qs.filter(entreprise_id=entreprise_id)

        return qs


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
@permission_classes([AllowAny])
def finance_view(request):
    entreprise_id = request.query_params.get("entreprise")

    entrees = Entree.objects.all()
    sorties = Sortie.objects.all()
    trans_revenus = Transaction.objects.filter(type='revenu', is_active=True)
    trans_depenses = Transaction.objects.filter(type='depense', is_active=True)

    if entreprise_id:
        entrees = entrees.filter(marchandise__entreprise_id=entreprise_id)
        sorties = sorties.filter(marchandise__entreprise_id=entreprise_id)
        trans_revenus = trans_revenus.filter(entreprise_id=entreprise_id)
        trans_depenses = trans_depenses.filter(entreprise_id=entreprise_id)


    return Response({
        "details": {
            "entrees": EntreeLightSerializer(entrees, many=True).data,
            "sorties": SortieLightSerializer(sorties, many=True).data,
            "transactions_revenus": TransactionSimpleSerializer(trans_revenus, many=True).data,
            "transactions_depenses": TransactionSimpleSerializer(trans_depenses, many=True).data,
        }
    })



@api_view(["GET"])
#@permission_classes([AllowAny, HasActiveSubscription])
@permission_classes([AllowAny])
def dashboard_view(request):
    entreprise_id = request.query_params.get("entreprise")

    today = timezone.now().date()
    start_week = today - timedelta(days=today.weekday())
    end_week = start_week + timedelta(days=6)

    # Filtrage par entreprise
    transactions = Transaction.objects.all()
    entrees = Entree.objects.all()
    sorties = Sortie.objects.all()
    marchandises = Marchandise.objects.filter(is_active=True)

    if entreprise_id:
        transactions = transactions.filter(entreprise_id=entreprise_id)
        entrees = entrees.filter(marchandise__entreprise_id=entreprise_id)
        sorties = sorties.filter(marchandise__entreprise_id=entreprise_id)
        marchandises = marchandises.filter(entreprise_id=entreprise_id)

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

    # Entrées par jour
    entrees_week = (
        entrees.filter(created_at__date__range=[start_week, end_week])
        .annotate(day=ExtractWeekDay("created_at"))  # 1=dimanche, 2=lundi...
        .values("day")
        .annotate(total=Count("id"))
    )
    graph_entrees = {j: 0 for j in jours_fr}
    for e in entrees_week:
        # Adjust: Django ExtractWeekDay -> 2=Lundi ... 1=Dimanche
        day_index = (e["day"] - 2) % 7
        graph_entrees[jours_fr[day_index]] = e["total"]

    # Sorties par jour
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
@permission_classes([AllowAny])
def rapport_stock(request):
    # --- Filtre entreprise ---
    entreprise_id = request.query_params.get("entreprise")

    # --- Marchandises ---
    marchandises = Marchandise.objects.filter(is_active=True)

    # --- Entrées & Sorties ---
    entrees = Entree.objects.all()
    sorties = Sortie.objects.all()

    if entreprise_id:
        marchandises = marchandises.filter(entreprise_id=entreprise_id)
        entrees = entrees.filter(marchandise__entreprise_id=entreprise_id)
        sorties = sorties.filter(marchandise__entreprise_id=entreprise_id)

    # --- Stats Marchandises ---
    total_marchandise = marchandises.count()

    valeur_marchandise = marchandises.aggregate(
        total=Sum(F('stock') * F('prix_vente'))
    )['total'] or 0

    marchandise_alertes = marchandises.filter(stock__lte=F('seuil')).count()

    total_stock = marchandises.aggregate(total_stock=Sum('stock'))['total_stock'] or 0
    stock_moyen = total_stock / total_marchandise if total_marchandise else 0

    marchandise_par_mois = {}
    for month in range(1, 13):
        marchandise_par_mois[datetime.date(2000, month, 1).strftime('%b')] = marchandises.filter(
            created_at__month=month
        ).count()

    # --- Stats Entrées ---
    article_en_entree = entrees.count()
    valeur_entree = entrees.aggregate(total=Sum('total'))['total'] or 0
    quantite_total_entree = entrees.aggregate(total=Sum('quantite'))['total'] or 0

    entree_par_mois = {}
    for month in range(1, 13):
        entree_par_mois[datetime.date(2000, month, 1).strftime('%b')] = entrees.filter(
            created_at__month=month
        ).aggregate(total=Sum('quantite'))['total'] or 0

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

    article_le_plus_sortie_obj = sorties.values('designation').annotate(
        qte=Sum('quantite')
    ).order_by('-qte').first()
    article_le_plus_sortie = article_le_plus_sortie_obj['designation'] if article_le_plus_sortie_obj else None

    sortie_par_mois = {}
    for month in range(1, 13):
        sortie_par_mois[datetime.date(2000, month, 1).strftime('%b')] = sorties.filter(
            created_at__month=month
        ).aggregate(total=Sum('quantite'))['total'] or 0

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
