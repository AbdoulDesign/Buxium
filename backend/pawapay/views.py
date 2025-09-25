import os
import uuid
import json
import hmac
import hashlib
import logging
import requests

from django.conf import settings
from django.http import JsonResponse, HttpResponse, HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Deposit
from accounts.models import Boutique, Plan, Subscription

logger = logging.getLogger(__name__)


PAWAPAY_WEBHOOK_SECRET = os.getenv("PAWAPAY_WEBHOOK_SECRET", "ma_cle_secrete")
PAWAPAY_API_URL = os.getenv("PAWAPAY_API_URL", "https://api.sandbox.pawapay.io/v2")
PAWAPAY_API_KEY = os.getenv("PAWAPAY_API_KEY", "eyJraWQiOiIxIiwiYWxnIjoiRVMyNTYifQ.eyJ0dCI6IkFBVCIsInN1YiI6IjEwNjIzIiwibWF2IjoiMSIsImV4cCI6MjA3Mzc2ODA4NCwiaWF0IjoxNzU4MjM1Mjg0LCJwbSI6IkRBRixQQUYiLCJqdGkiOiJmY2I3NjQ2Zi0yYmZmLTQzMTctODgwOS1kNjMxZTg4YTE0YmEifQ.yPGytJa8udR6eEuIx4T-enhiNqrD8tzp08uIaJugtD-GNipv5FEn4vkTxWvqo1CM-a-IQeRthYGbGQnoo-dupw")



# Génère un transaction_id unique pour Subscription
def generate_unique_transaction_id():
    while True:
        transaction_id = str(uuid.uuid4())
        if not Subscription.objects.filter(transaction_id=transaction_id).exists():
            return transaction_id


class DepositView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """Liste des pays et providers PawaPay"""
        try:
            resp = requests.get(
                f"{PAWAPAY_API_URL}/active-conf",
                headers={"Authorization": f"Bearer {PAWAPAY_API_KEY}"},
                params={"operationType": "DEPOSIT"},
                timeout=10,
            )
            resp.raise_for_status()
            return Response(resp.json(), status=status.HTTP_200_OK)
        except requests.RequestException as e:
            logger.error(f"Erreur chargement PawaPay active-conf: {str(e)}")
            return Response({"error": "Impossible de récupérer la configuration PawaPay"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        """Créer un dépôt et l’envoyer à PawaPay"""
        payload = request.data

        try:
            boutique = Boutique.objects.get(id=payload.get("boutique_id"))
            plan = Plan.objects.get(id=payload.get("plan_id"))

            # Création du dépôt avec un UUID unique
            deposit = Deposit.objects.create(
                boutique=boutique,
                plan=plan,
                amount=payload.get("amount"),
                currency=payload.get("currency"),
                country=payload.get("country"),
                phone_number=payload.get("payer", {}).get("accountDetails", {}).get("phoneNumber"),
                provider=payload.get("payer", {}).get("accountDetails", {}).get("provider"),
                status="pending",
                note="Création du dépôt"
            )

            deposit_id = str(deposit.deposit_uuid)  # ✅ identifiant partagé

            pawapay_payload = {
                "depositId": deposit_id,
                "amount": str(payload.get("amount")),
                "currency": payload.get("currency"),
                "payer": payload.get("payer"),
            }

            resp = requests.post(
                f"{PAWAPAY_API_URL}/deposits",
                json=pawapay_payload,
                headers={"Authorization": f"Bearer {PAWAPAY_API_KEY}"},
                timeout=15,
            )
            server_response = resp.json()

            # 🔹 Sandbox simulation
            if os.getenv("PAWAPAY_SANDBOX", "True") == "True":
                if server_response.get("status") == "ACCEPTED":
                    server_response["status"] = "COMPLETED"
                    deposit.status = "completed"
                    deposit.note = str(server_response)
                    deposit.save()

                    # ✅ Abonnement lié au même UUID
                    Subscription.objects.create(
                        boutique=boutique,
                        plan=plan,
                        transaction_id=deposit.deposit_uuid
                    )

                    return Response({
                        "depositId": deposit_id,
                        "transaction_id": deposit_id,
                        "status": "completed",
                        "server_response": server_response
                    }, status=200)

            deposit.note = str(server_response)
            deposit.save()

            return Response({
                "depositId": deposit_id,
                "transaction_id": deposit_id,
                "status": server_response.get("status", "pending"),
                "server_response": server_response
            }, status=200)

        except Boutique.DoesNotExist:
            return Response({"error": "Boutique introuvable"}, status=404)
        except Plan.DoesNotExist:
            return Response({"error": "Plan introuvable"}, status=404)
        except Exception as e:
            logger.error(f"Erreur création dépôt: {str(e)}")
            return Response({"error": str(e)}, status=500)


# -------------------- Webhook sécurisé -------------------- #

@csrf_exempt
def pawapay_webhook(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    signature = request.headers.get("X-Pawapay-Signature")
    body_bytes = request.body

    # Vérification HMAC
    local_signature = hmac.new(
        PAWAPAY_WEBHOOK_SECRET.encode(),
        body_bytes,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, local_signature):
        logger.warning("Webhook Pawapay : signature invalide")
        return HttpResponseForbidden("Signature invalide")

    try:
        payload = json.loads(body_bytes)
        deposit_id = payload.get("depositId")
        status_webhook = payload.get("status")

        deposit = Deposit.objects.get(note__contains=deposit_id)
        deposit.status = status_webhook.lower()
        deposit.note = f"{deposit.note}\nWebhook: {json.dumps(payload)}"
        deposit.save()

        # Créer l'abonnement si COMPLETED
        if status_webhook == "COMPLETED":
            Subscription.objects.create(
                boutique=deposit.boutique,
                plan=deposit.plan,
                transaction_id=deposit_id
            )

        logger.info(f"Webhook Pawapay traité: {deposit_id} - {status_webhook}")
        return JsonResponse({"message": "Webhook traité avec succès"})
    except Deposit.DoesNotExist:
        logger.error(f"Webhook Pawapay : dépôt introuvable {deposit_id}")
        return JsonResponse({"error": "Deposit introuvable"}, status=404)
    except Exception as e:
        logger.error(f"Webhook Pawapay erreur: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
