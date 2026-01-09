# core/models.py
"""
Django ORM models for the Blood Bank RAG AI system.

These models represent the core domain entities:
- Donor: Individuals willing to donate blood
- Hospital: Medical facilities requesting or storing blood
- Request: Blood requests made by hospitals for patients

The models are intentionally simple and structured to support:
- CRUD operations
- Semantic search with structured metadata
- Predictable, auditable AI behavior
"""

from django.db import models


class Donor(models.Model):
    """
    Represents a blood donor.

    Donor records are used both for:
    - Traditional CRUD operations
    - Semantic search embeddings with structured metadata
    """

    # Standardized blood group choices used across the system
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('O+', 'O+'), ('O-', 'O-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
    ]

    # Donor's full name
    name = models.CharField(max_length=100)

    # Donor's age (used as semantic signal, not strict filter)
    age = models.PositiveIntegerField()

    # Blood group with controlled vocabulary
    blood_group = models.CharField(
        max_length=3,
        choices=BLOOD_GROUP_CHOICES
    )

    # Contact number (stored as string to preserve formatting)
    contact = models.CharField(max_length=15)

    # City where the donor is located
    city = models.CharField(max_length=100)

    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        Human-readable representation used in Django admin
        and debugging contexts.
        """
        return f"{self.name} ({self.blood_group})"


class Hospital(models.Model):
    """
    Represents a hospital or medical facility.

    Hospitals can:
    - Submit blood requests
    - Be queried through semantic search
    - Act as a linking entity for blood requests
    """

    # Hospital name
    name = models.CharField(max_length=150)

    # Physical location or city
    location = models.CharField(max_length=150)

    # Hospital contact number
    contact = models.CharField(max_length=15)

    # Blood handling/storage capacity
    capacity = models.PositiveIntegerField()

    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        Returns the hospital name for display purposes.
        """
        return self.name


class Request(models.Model):
    """
    Represents a blood request for a specific patient.

    Requests link together:
    - A patient
    - A hospital
    - A required blood group and quantity

    Request records are included in semantic search to enable
    cross-entity reasoning (donors, hospitals, and requests).
    """

    # Reuse donor blood group choices to ensure consistency
    BLOOD_GROUP_CHOICES = Donor.BLOOD_GROUP_CHOICES

    # Allowed lifecycle states for a request
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('fulfilled', 'Fulfilled'),
        ('rejected', 'Rejected'),
    ]

    # Patient details (kept minimal for demo purposes)
    patient_name = models.CharField(max_length=100)
    patient_age = models.PositiveIntegerField()

    # Hospital making the request
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name="requests"
    )

    # Requested blood group
    blood_group = models.CharField(
        max_length=3,
        choices=BLOOD_GROUP_CHOICES
    )

    # Number of blood units requested
    units_requested = models.PositiveIntegerField()

    # Current request status
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        Returns a concise summary of the request, useful for
        admin views and logs.
        """
        return (
            f"{self.patient_name} ({self.patient_age}) - "
            f"{self.blood_group} @ {self.hospital.name}"
        )
