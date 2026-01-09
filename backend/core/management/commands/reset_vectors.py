# core/management/commands/reset_vectors.py
from django.core.management.base import BaseCommand
from core.mongo import collection

class Command(BaseCommand):
    help = "Completely reset AI vector store"

    def handle(self, *args, **kwargs):
        collection.drop()
        self.stdout.write(self.style.SUCCESS("AI vector store reset successfully"))
