# gestion-stock/serializers.py
from rest_framework import serializers
from .models import Marchandise, Entree, Sortie, Categorie, Fournisseur, Transaction
from .models import Transaction
from accounts.models import Entreprise
from accounts.serializers import EntrepriseRegisterSerializer


class CategorieSerializer(serializers.ModelSerializer):
    entreprise = serializers.PrimaryKeyRelatedField(
        queryset=Entreprise.objects.all()
    )
    class Meta:
        model = Categorie
        fields = ["id", "nom", "entreprise"]

class MarchandiseSerializer(serializers.ModelSerializer):
    categorie = serializers.PrimaryKeyRelatedField(
        queryset=Categorie.objects.all()
    )
    entreprise = serializers.PrimaryKeyRelatedField(
        queryset=Entreprise.objects.all()
    )

    class Meta:
        model = Marchandise
        fields = [
            "id",
            "reference",
            "designation",
            "unite",
            "seuil",
            "stock",
            "prix_achat",
            "prix_vente",
            "is_active",
            "image",
            "total",
            "created_at",
            "categorie",
            "entreprise",
        ]
        

class EntreeSerializer(serializers.ModelSerializer):
    marchandise = MarchandiseSerializer(read_only=True)
    marchandise_id = serializers.PrimaryKeyRelatedField(
        queryset=Marchandise.objects.filter(is_active=True), source="marchandise", write_only=True
    )

    class Meta:
        model = Entree
        fields = ["id", "quantite", "designation", "prix_unitaire", "total", "created_at", "marchandise", "marchandise_id"]
        read_only_fields = ["designation", "prix_unitaire", "total", "created_at"]

class SortieSerializer(serializers.ModelSerializer):
    marchandise = MarchandiseSerializer(read_only=True)
    marchandise_id = serializers.PrimaryKeyRelatedField(
        queryset=Marchandise.objects.filter(is_active=True), source="marchandise", write_only=True
    )

    class Meta:
        model = Sortie
        fields = ["id", "quantite", "designation", "prix_unitaire", "total", "created_at", "marchandise", "marchandise_id"]
        read_only_fields = ["designation", "prix_unitaire", "total", "created_at"]


class FournisseurSerializer(serializers.ModelSerializer):
    # lecture → liste complète des marchandises
    marchandises = MarchandiseSerializer(many=True, read_only=True)

    # écriture → liste d'IDs
    marchandises_ids = serializers.PrimaryKeyRelatedField(
        queryset=Marchandise.objects.all(),
        many=True,
        write_only=True,
        source="marchandises"
    )

    class Meta:
        model = Fournisseur
        fields = ["id", "reference", "nom", "telephone", "adresse", "email","created_at", "marchandises", "marchandises_ids"]



class TransactionSerializer(serializers.ModelSerializer):
    entreprise = serializers.PrimaryKeyRelatedField(
        queryset=Entreprise.objects.all()
    )
    class Meta:
        model = Transaction
        # On expose tous les champs
        fields = [
            "id",
            "type",
            "description",
            "montant",
            "entreprise",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["is_active", "created_at", "updated_at"]



# on garde uniquement les champs qui sont utile pour la vue Finance afin d'optimiser la requette
class MarchandiseLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marchandise
        fields = ["id", "entreprise"]  

# on garde uniquement les champs qui sont utile pour la vue Finance afin d'optimiser la requette
class EntreeLightSerializer(serializers.ModelSerializer):
    marchandise = MarchandiseLightSerializer()

    class Meta:
        model = Entree
        fields = ["id", "total", "created_at", "marchandise"]

# on garde uniquement les champs qui sont utile pour la vue Finance afin d'optimiser la requette
class SortieLightSerializer(serializers.ModelSerializer):
    marchandise = MarchandiseLightSerializer()

    class Meta:
        model = Sortie
        fields = ["id", "total", "created_at", "marchandise"]

# on garde uniquement les champs qui sont utile pour la vue Finance afin d'optimiser la requette
class TransactionSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["montant", "is_active", "created_at", "entreprise"]  # uniquement utile

