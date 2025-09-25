from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MarchandiseViewSet,
    EntreeViewSet,
    SortieViewSet,
    CategorieViewSet,
    InventaireExportView,
    FournisseurViewSet,
    TransactionViewSet,
    finance_view,
    dashboard_view,
    rapport_stock,
)

router = DefaultRouter()
router.register(r'marchandises', MarchandiseViewSet, basename='marchandise')
router.register(r'entrees', EntreeViewSet, basename='entree')
router.register(r'sorties', SortieViewSet, basename='sortie')
router.register(r'categories', CategorieViewSet, basename='categorie')
router.register(r'fournisseurs', FournisseurViewSet, basename='fournisseur')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path("", include(router.urls)),
    path("inventaire/export/", InventaireExportView.as_view(), name="inventaire-export"),
    path("dashboard", dashboard_view, name="dashboard"),
    path('rapport/', rapport_stock, name='rapport-stock'),
    path("finance/", finance_view, name="finance"),
]

"""
Nouvelles routes générées automatiquement par DRF Router :
- GET    /marchandises/archived/       → liste des marchandises désactivées
- POST   /marchandises/{id}/restore/   → restaurer une marchandise
- GET    /transactions/archived/            
- POST   /transactions/{id}/restore/       
"""

"""
- DELETE /marchandises/{id}/?hard=true → suppression definitive
- DELETE /sorties/{id}/?hard=true → suppression definitive
- DELETE /transactions/{id}/?hard=true → suppression definitive
- DELETE /entrees/{id}/?hard=true → suppression definitive
...

"""