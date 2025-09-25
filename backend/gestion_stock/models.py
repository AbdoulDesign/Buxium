from django.db import models
from django.db.models import Sum, F, DecimalField, ExpressionWrapper
from django.db import transaction


class Categorie(models.Model):
    boutique = models.ForeignKey(
        "accounts.Boutique",
        on_delete=models.CASCADE,
        related_name="categories"
    )
    label = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)  # ✅
    updated_at = models.DateTimeField(auto_now=True)      # optionnel

    class Meta:
        unique_together = ("boutique", "label")

    def __str__(self):
        return f"{self.label} ({self.boutique.name})"



class Marchandise(models.Model):
    num_seq = models.PositiveIntegerField(editable=False)  # séquence interne
    reference = models.CharField(max_length=50, blank=True, db_index=True)
    image = models.ImageField(upload_to="marchandises/", null=True, blank=True)
    name = models.CharField(max_length=100)
    categorie = models.ForeignKey(
        Categorie, on_delete=models.SET_NULL, null=True, related_name="marchandises"
    )
    boutique = models.ForeignKey(
        "accounts.Boutique",
        on_delete=models.CASCADE,
        related_name="marchandises"
    )
    unite = models.CharField(max_length=20)
    seuil = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2)
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0)

    # Soft delete
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("boutique", "reference")
        indexes = [
            models.Index(fields=["boutique", "num_seq"]),  # ⚡ optimisation recherche
        ]

    def save(self, *args, **kwargs):
        if not self.pk:  # seulement à la création
            # Séquence auto-incrémentée par boutique
            last = Marchandise.objects.filter(boutique=self.boutique).order_by("-num_seq").first()
            self.num_seq = (last.num_seq + 1) if last else 1

            # Générer la référence → Exemple : E1-M001
            self.reference = f"E{self.boutique.id}-M{self.num_seq:03d}"

        # Calcul du total
        self.total = self.stock * self.prix_vente

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference} - {self.name}"


    def delete(self, *args, **kwargs):
        """
        Au lieu de supprimer, on désactive la marchandise.
        """
        self.is_active = False
        self.save(update_fields=["is_active"])

    def __str__(self):
        return f"{self.name} ({self.reference})"



class Entree(models.Model):
    marchandise = models.ForeignKey(
        Marchandise, on_delete=models.SET_NULL, null=True, related_name="entrees"
    )
    boutique = models.ForeignKey(
        "accounts.Boutique",
        on_delete=models.CASCADE,
        related_name="entrees"
    )
    # Snapshot des infos de la marchandise
    name = models.CharField(max_length=150)
    prix_unitaire = models.DecimalField(max_digits=12, decimal_places=2)

    quantite = models.PositiveIntegerField()
    total = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None  # 👉 nouvel enregistrement ?

        if self.marchandise:
            if is_new:
                # Snapshot uniquement à la création
                self.name = self.marchandise.name
                self.prix_unitaire = self.marchandise.prix_achat
                self.total = self.quantite * self.prix_unitaire

                # Mise à jour du stock
                with transaction.atomic():
                    self.marchandise.stock += self.quantite
                    self.marchandise.total = self.marchandise.stock * self.marchandise.prix_achat
                    self.marchandise.save(update_fields=["stock", "total"])
                    super().save(*args, **kwargs)
            else:
                # Si modification, ne pas toucher au prix_unitaire existant
                super().save(*args, **kwargs)
        else:
            self.total = 0
            super().save(*args, **kwargs)

    def __str__(self):
        unite = self.marchandise.unite if self.marchandise else ""
        return f"Entrée {self.name} - {self.quantite} {unite}"


class Sortie(models.Model):
    marchandise = models.ForeignKey(
        Marchandise, on_delete=models.SET_NULL, null=True, related_name="sorties"
    )
    boutique = models.ForeignKey(
        "accounts.Boutique",
        on_delete=models.CASCADE,
        related_name="sorties"
    )
    # Snapshot des infos
    name = models.CharField(max_length=150)
    prix_unitaire = models.DecimalField(max_digits=12, decimal_places=2)

    quantite = models.PositiveIntegerField()
    total = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None  # 👉 nouvel enregistrement ?

        if self.marchandise:
            if is_new:
                # Snapshot uniquement à la création
                self.name = self.marchandise.name
                self.prix_unitaire = self.marchandise.prix_vente
                self.total = self.quantite * self.prix_unitaire

                # Mise à jour du stock
                with transaction.atomic():
                    self.marchandise.stock -= self.quantite
                    self.marchandise.total = (
                        self.marchandise.stock * self.marchandise.prix_vente
                    )
                    self.marchandise.save(update_fields=["stock", "total"])
                    super().save(*args, **kwargs)
            else:
                # Si modification, on ne modifie pas le prix_unitaire déjà fixé
                super().save(*args, **kwargs)
        else:
            self.total = 0
            super().save(*args, **kwargs)

    def __str__(self):
        unite = self.marchandise.unite if self.marchandise else ""
        return f"Sortie {self.name} - {self.quantite} {unite}"


class Fournisseur(models.Model):
    num_seq = models.PositiveIntegerField(editable=False)  # séquence interne
    reference = models.CharField(max_length=50, blank=True, db_index=True)
    name = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    adresse = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    boutique = models.ForeignKey(
        "accounts.Boutique",
        on_delete=models.CASCADE,
        related_name="fournisseurs"
    )

    marchandises = models.ManyToManyField(
        "Marchandise",
        related_name="fournisseurs",
        blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("boutique", "reference")  # 🔒 unicité
        indexes = [
            models.Index(fields=["boutique", "num_seq"]),  # ⚡ accélère les recherches
        ]

    def save(self, *args, **kwargs):
        if not self.pk:  # seulement à la création
            # Récupérer le dernier num_seq de boutique
            last = Fournisseur.objects.filter(boutique=self.boutique).order_by("-num_seq").first()
            self.num_seq = (last.num_seq + 1) if last else 1

            # Exemple : E1-F001
            self.reference = f"E{self.boutique.id}-F{self.num_seq:03d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.reference})"



class Transaction(models.Model):
    TYPE_CHOICES = [
        ("revenu", "Revenu"),
        ("depense", "Dépense"),
    ]

    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255)
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    boutique = models.ForeignKey(
        "accounts.Boutique",
        on_delete=models.CASCADE,
        related_name="transactions"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.type} - {self.montant} FCFA"
