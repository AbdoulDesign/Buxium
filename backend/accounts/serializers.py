from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import ( User, Boutique, Personnel, Activite, ProfilPersonnel,
Plan, Subscription
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']


class UserMeSerializer(serializers.ModelSerializer):
    boutique = serializers.SerializerMethodField()
    profil = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'boutique', 'profil']

    def get_boutique(self, obj):
        role = getattr(obj, "role", None)

        if role == "personnel":
            if hasattr(obj, "personnel_profil") and obj.personnel_profil.boutique:
                return BoutiqueSerializer(obj.personnel_profil.boutique).data

        elif role == "boutique":
            if hasattr(obj, "boutique_profil"):
                return BoutiqueSerializer(obj.boutique_profil).data

        elif role == "admin":
            boutiques = Boutique.objects.all()
            return BoutiqueSerializer(boutiques, many=True).data

        return None

    def get_profil(self, obj):
        """Retourne le profil si l'utilisateur est un personnel"""
        role = getattr(obj, "role", None)
        if role == "personnel" and hasattr(obj, "personnel_profil"):
            return ProfilPersonnelSerializer(obj.personnel_profil.profil).data
        return None



class ActiviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activite
        fields = ["id", "label"]

class ProfilPersonnelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilPersonnel
        fields = ["id", "label"]

class SetNewPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, required=True)

    def save(self, **kwargs):
        user = self.context['user']  # peut être Utilisateur ou Entreprise
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class BoutiqueSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Boutique
        fields = ['id', 'name', 'adresse', 'telephone', "activite", "user","logo", "is_active"]


class PersonnelSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    boutique = BoutiqueSerializer(read_only=True)

    class Meta:
        model = Personnel
        fields = ['id', 'profil', 'name', 'user', 'boutique']


class PersonnelUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Personnel
        fields = ["id", "profil", "name", "username", "email", "is_active"]

    def update(self, instance, validated_data):
        # mise à jour user si fourni
        user = instance.user
        if "username" in validated_data:
            user.username = validated_data.pop("username")
        if "email" in validated_data:
            user.email = validated_data.pop("email")
        user.save()

        # mise à jour du personnel
        return super().update(instance, validated_data)



# ---- Signup pour Admin ----
class AdminSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
            role="admin"
        )
        return user


# ---- Signup pour Boutique ----
class BoutiqueSignupSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Boutique
        fields = [
            "id", "name", "adresse", "telephone", "activite", "logo", "is_active",
            "user", "username", "email", "password"
        ]

    def create(self, validated_data):
        username = validated_data.pop("username")
        email = validated_data.pop("email")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role="boutique"
        )
        validated_data["user"] = user
        return super().create(validated_data)

    def validate_username(self, value):
        """Vérifie qu'aucun User n'a déjà ce username"""
        if self.instance and self.instance.user.username == value:
            return value  # pas de changement

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur existe déjà.")
        return value


# ---- Signup pour Personnel ----
class PersonnelSignupSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    boutique = serializers.PrimaryKeyRelatedField(
        queryset=Boutique.objects.all(),
        write_only=True  # Ajoutez ceci
    )

    class Meta:
        model = Personnel
        fields = ["id", "profil", "name", "user", "boutique", "username", "email", "password"]
        read_only_fields = ["user"]  # Le user sera créé, pas modifié

    def create(self, validated_data):
        username = validated_data.pop("username")
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        boutique = validated_data.pop("boutique")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role="personnel"
        )
        
        # Créez le personnel avec la boutique
        personnel = Personnel.objects.create(
            user=user,
            boutique=boutique,
            **validated_data
        )
        return personnel

    def validate_username(self, value):
        """
        Vérifie qu'aucune boutique ou personnel n'a déjà ce username.
        """
        if User.objects.filter(username=value, role__in=["boutique", "personnel"]).exists():
            raise serializers.ValidationError(
                "Ce nom d'utilisateur est déjà utilisé par une boutique ou un personnel."
            )
        return value

    def to_representation(self, instance):
        # Pour la réponse, utilisez le PersonnelSerializer
        return PersonnelSerializer(instance, context=self.context).data


# Custom JWT Serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ajouter des claims personnalisés
        token['username'] = user.username
        token['role'] = user.role
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        # Ajouter des données supplémentaires à la réponse
        data['user'] = UserSerializer(self.user).data
        return data

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ["id", "name", "price", "duration_days"]


class SubscriptionSerializer(serializers.ModelSerializer):
    boutique_name = serializers.CharField(source="boutique.name", read_only=True)
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    status = serializers.CharField(read_only=True)
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = ["id", "boutique", "boutique_name", "plan", "plan_name",
                  "start_date", "end_date", "status", "is_expired", "transaction_id"]
        read_only_fields = ["start_date", "end_date", "status", "is_expired"]

    def get_is_expired(self, obj):
        return not obj.is_active()
    
    def validate_transaction_id(self, value):
        """Valider que la référence est unique si fournie manuellement"""
        if value:
            # Vérifier si la référence existe déjà (exclure l'instance actuelle si mise à jour)
            queryset = Subscription.objects.filter(transaction_id=value)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("Cette référence existe déjà.")
        return value

