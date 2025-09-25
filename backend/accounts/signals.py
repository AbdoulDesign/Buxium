# accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Boutique, Subscription, Plan
from django.utils import timezone
from datetime import timedelta

@receiver(post_save, sender=Boutique)
def ensure_free_subscription(sender, instance, created, **kwargs):
    """
    Lors de la création d'une boutique, créer automatiquement un plan Gratuit si nécessaire
    et rattacher une subscription Gratuit (7 jours) active.
    """
    if not created:
        return

    gratuit_plan, _ = Plan.objects.get_or_create(
        name="Gratuit",
        defaults={"price": 0, "duration_days": 7}
    )

    # Créer l'abonnement gratuit
    start = timezone.now()
    end = start + timedelta(days=gratuit_plan.duration_days)
    Subscription.objects.create(
        boutique=instance,
        plan=gratuit_plan,
        start_date=start,
        end_date=end,
        status=Subscription.STATUS_ACTIVE
    )
