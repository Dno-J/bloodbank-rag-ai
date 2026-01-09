# core/views.py

from django.http import JsonResponse
from rest_framework import viewsets

from .models import Donor, Hospital, Request
from .serializers import (
    DonorSerializer,
    HospitalSerializer,
    RequestSerializer,
)


class DonorViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Donors
    """
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer


class HospitalViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Hospitals
    """
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer


class RequestViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Blood Requests
    """
    queryset = Request.objects.all()
    serializer_class = RequestSerializer


def health(request):
    """
    Simple health check endpoint
    """
    return JsonResponse({"status": "ok"})
