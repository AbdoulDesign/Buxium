# gestion-stock/serializers.py
from rest_framework import serializers
from .models import Marchandise, Entree, Sortie, Categorie, Fournisseur, Transaction
from .models import Transaction
from accounts.models import Boutique


class CategorieSerializer(serializers.ModelSerializer):
    boutique = serializers.PrimaryKeyRelatedField(
        queryset=Boutique.objects.all()
    )
    class Meta:
        model = Categorie
        fields = ["id", "label", "boutique"]

class MarchandiseSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source="categorie.label", read_only=True)
    boutique = serializers.PrimaryKeyRelatedField(
        queryset=Boutique.objects.all()
    )

    class Meta:
        model = Marchandise
        fields = [
            "id",
            "reference",
            "name",
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
            "categorie_nom",
            "boutique",
        ]
        read_only_fields = ["reference", "categorie_nom", "total", "created_at"]
        

class EntreeSerializer(serializers.ModelSerializer):
    marchandise = MarchandiseSerializer(read_only=True)
    marchandise_id = serializers.PrimaryKeyRelatedField(
        queryset=Marchandise.objects.filter(is_active=True), source="marchandise", write_only=True
    )

    class Meta:
        model = Entree
        fields = ["id", "quantite", "name", "boutique", "prix_unitaire", "total", "created_at", "marchandise", "marchandise_id"]
        read_only_fields = ["name", "prix_unitaire", "total", "created_at"]


class SortieSerializer(serializers.ModelSerializer):
    marchandise = MarchandiseSerializer(read_only=True)
    marchandise_id = serializers.PrimaryKeyRelatedField(
        queryset=Marchandise.objects.filter(is_active=True),
        source="marchandise",
        write_only=True
    )

    class Meta:
        model = Sortie
        fields = [
            "id",
            "quantite",
            "name",
            "prix_unitaire",
            "total",
            "boutique",
            "created_at",
            "marchandise",
            "marchandise_id",
        ]
        read_only_fields = ["name", "prix_unitaire", "total", "created_at"]

    def validate(self, attrs):
        marchandise = attrs.get("marchandise")
        quantite = attrs.get("quantite")

        if marchandise and quantite and quantite > marchandise.stock:
            raise serializers.ValidationError({
                "quantite": f"Stock insuffisant pour {marchandise.name}. "
                            f"Disponible : {marchandise.stock}"
            })
        return attrs



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
        fields = ["id", "reference", "name", "telephone", "adresse", "boutique", "email", "is_active","created_at", "marchandises", "marchandises_ids"]
        read_only_fields = ["reference", "created_at"]



class TransactionSerializer(serializers.ModelSerializer):
    boutique = serializers.PrimaryKeyRelatedField(
        queryset=Boutique.objects.all()
    )
    class Meta:
        model = Transaction
        # On expose tous les champs
        fields = [
            "id",
            "type",
            "description",
            "montant",
            "boutique",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["is_active", "created_at", "updated_at"]



# on garde uniquement les champs qui sont utile pour la vue Finance afin d'optimiser la requette
class MarchandiseLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marchandise
        fields = ["id", "boutique"]  

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
        fields = ["montant", "is_active", "created_at", "boutique"]  # uniquement utile

