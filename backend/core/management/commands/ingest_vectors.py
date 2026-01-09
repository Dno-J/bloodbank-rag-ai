# core/management/commands/ingest_vectors.py

from django.core.management.base import BaseCommand
from pymongo import MongoClient

from core.models import Donor, Hospital, Request
from core.utils import generate_embedding, vector_insert


class Command(BaseCommand):
    help = "Wipe vector DB and ingest donors, hospitals, and requests"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Resetting vector database..."))

        # HARD RESET vector DB (only vectors collection)
        client = MongoClient("mongodb://localhost:27017/")
        db = client["bloodbank_ai"]

        db["vectors"].delete_many({})
        self.stdout.write(self.style.WARNING("Cleared collection: vectors"))

        self.stdout.write(self.style.SUCCESS("Vector DB wiped successfully.\n"))

        # INGEST DONORS
        self.stdout.write(self.style.NOTICE("Ingesting donors..."))

        for donor in Donor.objects.all():
            doc = (
                f"Donor: {donor.name}, "
                f"Age {donor.age}, "
                f"Blood Group {donor.blood_group}, "
                f"City {donor.city}, "
                f"Contact {donor.contact}"
            )

            embedding = generate_embedding(doc)
            metadata = {
                "name": donor.name,
                "age": donor.age,
                "blood_group": donor.blood_group,
                "city": donor.city,
                "contact": donor.contact,
            }

            vector_insert("donor", donor.id, embedding, metadata)
            self.stdout.write(self.style.SUCCESS(f"Ingested donor: {donor.name}"))

        # INGEST HOSPITALS
        self.stdout.write(self.style.NOTICE("\nIngesting hospitals..."))

        for hospital in Hospital.objects.all():
            doc = (
                f"Hospital: {hospital.name}, "
                f"Location {hospital.location}, "
                f"Capacity {hospital.capacity}, "
                f"Contact {hospital.contact}"
            )

            embedding = generate_embedding(doc)
            metadata = {
                "name": hospital.name,
                "location": hospital.location,
                "capacity": hospital.capacity,
                "contact": hospital.contact,
            }

            vector_insert("hospital", hospital.id, embedding, metadata)
            self.stdout.write(self.style.SUCCESS(f"Ingested hospital: {hospital.name}"))

        # INGEST REQUESTS
        self.stdout.write(self.style.NOTICE("\nIngesting requests..."))

        for req in Request.objects.all():
            doc = (
                f"Request: Patient {req.patient_name}, "
                f"Age {req.patient_age}, "
                f"Blood Group {req.blood_group}, "
                f"Units {req.units_requested}, "
                f"Hospital {req.hospital.name}, "
                f"Status {req.status}"
            )

            embedding = generate_embedding(doc)
            metadata = {
                "patient_name": req.patient_name,
                "patient_age": req.patient_age,
                "blood_group": req.blood_group,
                "units_requested": req.units_requested,
                "hospital": req.hospital.name,
                "status": req.status,
            }

            vector_insert("request", req.id, embedding, metadata)
            self.stdout.write(self.style.SUCCESS(f"Ingested request: {req.patient_name}"))

        self.stdout.write(self.style.SUCCESS("\n✅ Ingestion completed successfully!"))
