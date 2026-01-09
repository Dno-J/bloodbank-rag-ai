# core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DonorViewSet, HospitalViewSet, RequestViewSet
from .views_ai import AISearchView

router = DefaultRouter()
router.register(r'donors', DonorViewSet)
router.register(r'hospitals', HospitalViewSet)
router.register(r'requests', RequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ai/search/', AISearchView.as_view(), name='ai-search'),
]
