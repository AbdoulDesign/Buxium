from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Entreprise, Utilisateur, Activite, Role, Plan, Subscription, Payment



class ActiviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activite
        fields = ["id", "label"]

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "label"]

# --- Serializer pour Entreprise ---
class EntrepriseRegisterSerializer(serializers.ModelSerializer):
    activite = ActiviteSerializer(read_only=True)
    activite_id = serializers.PrimaryKeyRelatedField(
        queryset=Activite.objects.all(), source="activite", write_only=True
    )
    # password facultatif à l'update
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Entreprise
        fields = ["id", "username", "password", "nom", "email", "telephone", "adresse", "logo", "is_active", "created_at", "activite", "activite_id"]
        read_only_fields = ("created_at", "is_active")

    def validate_username(self, value):
        """
        Permet la mise à jour sans déclencher l'erreur 'username exists' lorsque
        l'utilisateur ne change pas son username.
        """
        # Cherche les entreprises ayant ce username (sauf l'instance courante si update)
        qs_ent = Entreprise.objects.filter(username=value)
        if self.instance:
            qs_ent = qs_ent.exclude(pk=self.instance.pk)
        if qs_ent.exists():
            raise serializers.ValidationError("Ce username est déjà utilisé par une entreprise.")

        # Vérifie conflit avec Utilisateur
        if Utilisateur.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce username existe déjà dans un utilisateur.")
        return value

    def create(self, validated_data):
        if validated_data.get("password"):
            validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # gère le password si fourni
        password = validated_data.pop("password", None)
        # let DRF handle activite via 'activite' si présent
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.password = make_password(password)
        instance.save()
        return instance


class SetNewPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, required=True)

    def save(self, **kwargs):
        user = self.context['user']  # peut être Utilisateur ou Entreprise
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


# --- Serializer pour Utilisateur ---
class UtilisateurRegisterSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source="role", write_only=True
    )
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Utilisateur
        fields = ["id", "username", "password", "nom", "role", "role_id", "is_active", "created_at", "entreprise"]
        read_only_fields = ("created_at", "is_active")

    def validate_username(self, value):
        """
        Autorise la validation quand on update le même utilisateur (on exclut self.instance).
        Empêche aussi les collisions avec une entreprise existante.
        """
        qs_user = Utilisateur.objects.filter(username=value)
        if self.instance:
            qs_user = qs_user.exclude(pk=self.instance.pk)
        if qs_user.exists():
            raise serializers.ValidationError("Ce username est déjà utilisé par un autre utilisateur.")

        # Conflit cross-table : username d'une entreprise
        # (si une entreprise a ce username, on le refuse)
        if Entreprise.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce username existe déjà dans une entreprise.")
        return value

    def create(self, validated_data):
        if validated_data.get("password"):
            validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.password = make_password(password)
        instance.save()
        return instance


# --- Serializer pour Login (Entreprise ou Utilisateur) ---
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)



class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ["id", "name", "price", "duration_days"]


class SubscriptionSerializer(serializers.ModelSerializer):
    entreprise_username = serializers.CharField(source="entreprise.username", read_only=True)

    class Meta:
        model = Subscription
        fields = ["id", "entreprise", "entreprise_username", "plan", "start_date", "end_date", "is_active"]
        read_only_fields = ["start_date", "end_date", "is_active"]


class PaymentSerializer(serializers.ModelSerializer):
    entreprise_username = serializers.CharField(source="entreprise.username", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "entreprise", "entreprise_username", "plan", "amount", "payment_date", "reference"]
        read_only_fields = ["payment_date"]
