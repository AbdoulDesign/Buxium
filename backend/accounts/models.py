from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from datetime import timedelta

# -----------------------
# Choix prédéfinis
# -----------------------

class Activite(models.Model):
    label = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.label

class Role(models.Model):
    label = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.label

# -----------------------
# Managers
# -----------------------
class EntrepriseManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("Le username est obligatoire")
        entreprise = self.model(username=username, **extra_fields)
        entreprise.set_password(password)
        entreprise.save(using=self._db)
        return entreprise

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, password, **extra_fields)


class UtilisateurManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("Le username est obligatoire")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, password, **extra_fields)


# -----------------------
# Modèle Entreprise
# -----------------------
class Entreprise(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=30, unique=True)
    nom = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)
    activite = models.ForeignKey(
        Activite, on_delete=models.SET_NULL, null=True, related_name="entreprises"
    )
    logo = models.ImageField(upload_to="entreprises/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["nom"]

    objects = EntrepriseManager()

    # Evite les conflits de reverse accessor avec Utilisateur
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='entreprise_groups',
        blank=True,
        help_text='The groups this entreprise belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='entreprise_user_permissions',
        blank=True,
        help_text='Specific permissions for this entreprise.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return f"Entreprise: {self.username}"


# -----------------------
# Modèle Utilisateur
# -----------------------
class Utilisateur(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=30, unique=True)
    nom = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    entreprise = models.ForeignKey(
        Entreprise,
        on_delete=models.CASCADE,
        related_name="utilisateurs",
        null=True,
        blank=True
    )
    role = models.ForeignKey(
        Role, on_delete=models.SET_NULL, null=True, related_name="utilisateurs"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["nom", "role"]

    objects = UtilisateurManager()

    # Evite les conflits de reverse accessor avec Entreprise
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='utilisateur_groups',
        blank=True,
        help_text='The groups this utilisateur belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='utilisateur_user_permissions',
        blank=True,
        help_text='Specific permissions for this utilisateur.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return f"Utilisateur: {self.username} ({self.role})"


class Plan(models.Model):
    name = models.CharField(max_length=50, unique=True)  # ex: Gratuit, Mensuel, Trimestriel
    price = models.DecimalField(max_digits=10, decimal_places=2)  # ex: 0, 500, 1000
    duration_days = models.PositiveIntegerField()  # ex: 7, 30, 90

    def __str__(self):
        return f"{self.name} - {self.price} FCFA"


class Subscription(models.Model):
    entreprise = models.OneToOneField(
        Entreprise, on_delete=models.CASCADE, related_name="subscription"
    )
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        # si c’est une nouvelle souscription, calcule la date de fin
        if not self.pk and self.plan:
            self.start_date = timezone.now()
            self.end_date = self.start_date + timedelta(days=self.plan.duration_days)
        super().save(*args, **kwargs)

    def has_expired(self):
        return timezone.now() > self.end_date

    def __str__(self):
        return f"{self.entreprise.username} - {self.plan.name}"


class Payment(models.Model):
    entreprise = models.ForeignKey(Entreprise, on_delete=models.CASCADE)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    reference = models.CharField(max_length=100, unique=True)  # id transaction mobile money ou autre

    def __str__(self):
        return f"{self.entreprise.username} - {self.amount} FCFA ({self.plan})"
