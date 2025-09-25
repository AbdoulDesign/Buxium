from django.urls import path
from .views import DepositView, pawapay_webhook

urlpatterns = [
    path("pawapay/", DepositView.as_view(), name="deposit"),
    path("pawapay/webhook/", pawapay_webhook, name="pawapay-webhook"),
]
