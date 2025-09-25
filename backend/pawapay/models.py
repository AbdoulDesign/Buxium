from django.db import models
from accounts.models import Boutique, Plan
import uuid

class Deposit(models.Model):
    deposit_uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)  # ✅ UUID unique partagé
    boutique = models.ForeignKey(Boutique, on_delete=models.CASCADE, related_name="deposits")
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name="deposits")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10)
    country = models.CharField(max_length=5)
    phone_number = models.CharField(max_length=20)
    provider = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default="pending")  # pending/completed/failed
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Deposit {self.deposit_uuid} - {self.amount} {self.currency} ({self.status})"