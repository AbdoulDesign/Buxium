# accounts/apps.py
from django.apps import AppConfig

class AccountsConfig(AppConfig):
    name = "accounts"

    def ready(self):
        # importe signals pour assurer l'enregistrement
        import accounts.signals  # noqa
