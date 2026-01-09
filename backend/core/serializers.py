from rest_framework import serializers
from .models import Donor, Hospital, Request


class DonorSerializer(serializers.ModelSerializer):
    """
    Serializer for the Donor model.

    Purpose:
    - Exposes all donor fields via the API
    - Used for CRUD operations on donors

    Notes:
    - No custom read/write behavior required
    - Suitable for both list and detail views
    """

    class Meta:
        model = Donor
        fields = "__all__"


class HospitalSerializer(serializers.ModelSerializer):
    """
    Serializer for the Hospital model.

    Purpose:
    - Exposes all hospital fields via the API
    - Used for CRUD operations on hospitals

    Notes:
    - Capacity and contact fields are included as-is
    - No derived or nested fields required
    """

    class Meta:
        model = Hospital
        fields = "__all__"


class RequestSerializer(serializers.ModelSerializer):
    """
    Serializer for the Request model.

    This serializer intentionally separates READ and WRITE behavior
    for the hospital relationship to improve API usability.

    Read behavior:
    - Exposes `hospital` as the hospital name (string)
    - Prevents clients from needing to resolve hospital IDs manually

    Write behavior:
    - Accepts `hospital_id` to associate a request with a hospital
    - Maps `hospital_id` → `hospital` ForeignKey internally

    This design keeps API responses human-readable while
    preserving proper relational integrity.
    """

    # READ: return hospital name instead of numeric ID
    hospital = serializers.CharField(
        source="hospital.name",
        read_only=True
    )

    # WRITE: accept hospital primary key when creating/updating
    hospital_id = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all(),
        source="hospital",
        write_only=True
    )

    class Meta:
        model = Request
        fields = [
            "id",
            "patient_name",
            "patient_age",
            "blood_group",
            "hospital",        # readable hospital name (READ)
            "hospital_id",     # hospital foreign key (WRITE)
            "units_requested",
            "status",
            "created_at",
            "updated_at",
        ]
