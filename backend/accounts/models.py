from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('boutique', 'Boutique'),
        ('personnel', 'Personnel'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="personnel")

    def __str__(self):
        return f"{self.username} ({self.role})"


class Activite(models.Model):
    label = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.label


class ProfilPersonnel(models.Model):
    label = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.label


class Boutique(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='boutique_profil')
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)  # email de contact (différent du User)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)
    activite = models.ForeignKey(Activite, on_delete=models.CASCADE, related_name="boutiques")
    logo = models.ImageField(upload_to="boutiques/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Personnel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='personnel_profil')
    name = models.CharField(max_length=255, null=True)
    boutique = models.ForeignKey(Boutique, on_delete=models.CASCADE, related_name='personnels')
    email = models.EmailField(blank=True, null=True)  # optionnel si différent du User.email
    profil = models.ForeignKey(ProfilPersonnel, on_delete=models.CASCADE, related_name="personnels")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.profil}"


class Plan(models.Model):
    name = models.CharField(max_length=50, unique=True)  # ex: Gratuit, Mensuel, Trimestriel
    price = models.PositiveIntegerField()  # ex: 0, 500, 1000
    duration_days = models.PositiveIntegerField()  # ex: 7, 30, 90

    def __str__(self):
        return f"{self.name} - {self.price} FCFA"


class Subscription(models.Model):
    STATUS_ACTIVE = "active"
    STATUS_EXPIRED = "expired"

    STATUS_CHOICES = (
        (STATUS_ACTIVE, "Active"),
        (STATUS_EXPIRED, "Expired"),
    )

    boutique = models.ForeignKey(Boutique, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    transaction_id = models.UUIDField(unique=True, editable=False, null=True, blank=True)  # ✅ UUID = deposit_uuid
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        if is_new and self.plan and not self.end_date:
            self.start_date = timezone.now()
            self.end_date = self.start_date + timedelta(days=self.plan.duration_days)
            self.status = self.STATUS_ACTIVE

        super().save(*args, **kwargs)

        if self.status == self.STATUS_ACTIVE and self.boutique:
            Subscription.objects.filter(
                boutique=self.boutique,
                status=self.STATUS_ACTIVE
            ).exclude(id=self.pk).update(
                status=self.STATUS_EXPIRED,
                updated_at=timezone.now()
            )

    def refresh_status_if_needed(self):
        if self.status == self.STATUS_ACTIVE and timezone.now() > self.end_date:
            self.status = self.STATUS_EXPIRED
            self.save(update_fields=["status", "updated_at"])
            return True
        return False

    def is_active(self):
        if self.status != self.STATUS_ACTIVE:
            return False
        if timezone.now() > self.end_date:
            self.status = self.STATUS_EXPIRED
            self.save(update_fields=["status", "updated_at"])
            return False
        return True

    def __str__(self):
        plan_name = self.plan.name if self.plan else "—"
        return f"{self.boutique.name} - {plan_name} ({self.status})"