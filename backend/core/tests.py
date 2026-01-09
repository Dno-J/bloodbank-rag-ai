# core/tests.py

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from unittest.mock import patch

from .models import Donor, Hospital, Request
from .serializers import RequestSerializer


class CoreAppTests(TestCase):
    def setUp(self):
        # Hospital
        self.hospital = Hospital.objects.create(
            name="City Hospital",
            location="Udaipur",
            contact="9999999999",
            capacity=200,
        )

        # Donor
        self.donor = Donor.objects.create(
            name="Dino Jackson",
            age=24,
            blood_group="O+",
            contact="8888888888",
            city="Udaipur",
        )

        # Request (patient age intentionally different from donor)
        self.request_record = Request.objects.create(
            patient_name="Rohit Sharma",
            patient_age=54,
            hospital=self.hospital,
            blood_group="A-",
            units_requested=45,
            status="pending",
        )

        self.client = APIClient()

    # MODEL TESTS

    def test_models_str(self):
        """Model __str__ implementations should contain key fields."""
        self.assertIn(self.donor.name, str(self.donor))
        self.assertIn(self.hospital.name, str(self.hospital))
        self.assertIn(self.request_record.patient_name, str(self.request_record))
        self.assertIn(str(self.request_record.patient_age), str(self.request_record))

    # SERIALIZER TESTS

    def test_request_serializer_hospital_name(self):
        """RequestSerializer exposes hospital name for reads."""
        serializer = RequestSerializer(self.request_record)
        data = serializer.data

        self.assertIn("hospital", data)
        self.assertEqual(data["hospital"], self.hospital.name)

    # CRUD ENDPOINT TESTS

    def test_donor_list_endpoint(self):
        """GET /api/donors/ returns created donors."""
        url = reverse("donor-list")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        names = [d["name"] for d in resp.json()]
        self.assertIn(self.donor.name, names)

    # AI SEARCH TESTS

    def test_ai_search_requires_query(self):
        """Query is mandatory for AI search."""
        url = reverse("ai-search")
        resp = self.client.post(url, {}, format="json")

        self.assertEqual(resp.status_code, 400)
        self.assertIn("error", resp.json())

    @patch("core.views_ai.llm_summarize")
    @patch("core.views_ai.generate_embedding")
    @patch("core.views_ai.vector_search")
    def test_ai_search_age_filter_no_match(
            self,
            mock_vector_search,
            mock_generate_embedding,
            mock_llm_summarize,
    ):
        """
        Strict numeric filters (age) should return empty results
        when no metadata matches exist.
        """
        mock_generate_embedding.return_value = [0.0]
        mock_vector_search.return_value = []
        mock_llm_summarize.return_value = "No relevant results found for this query."

        url = reverse("ai-search")
        payload = {"query": "show data of patient whose age is 24"}

        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, 200)

        body = resp.json()

        self.assertIn("results", body)
        self.assertEqual(body["results"], [])
        self.assertIn("ai_summary", body)

        # Accept clear human-safe phrasing OR numeric phrasing
        self.assertTrue(
            "no relevant results" in body["ai_summary"].lower()
            or "0 results" in body["ai_summary"].lower()
        )

    @patch("core.views_ai.llm_summarize")
    @patch("core.views_ai.generate_embedding")
    @patch("core.views_ai.vector_search")
    def test_ai_search_returns_matches_when_results_exist(
        self,
        mock_vector_search,
        mock_generate_embedding,
        mock_llm_summarize,
    ):
        """
        AI search returns results and summary when vector search
        yields matching records.
        """
        simulated_result = {
            "type": "request",
            "record_id": self.request_record.id,
            "metadata": {
                "patient_name": self.request_record.patient_name,
                "patient_age": self.request_record.patient_age,
                "blood_group": self.request_record.blood_group,
                "units_requested": self.request_record.units_requested,
                "hospital": self.hospital.name,
                "status": self.request_record.status,
            },
            "score": 0.95,
        }

        mock_generate_embedding.return_value = [0.0]
        mock_vector_search.return_value = [simulated_result]
        mock_llm_summarize.return_value = (
            f"Top match: {self.request_record.patient_name}"
        )

        url = reverse("ai-search")
        payload = {"query": "show data of patient whose age is 54"}

        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, 200)

        body = resp.json()

        self.assertIn("results", body)
        self.assertEqual(len(body["results"]), 1)
        self.assertEqual(body["results"][0]["type"], "request")
        self.assertIn("ai_summary", body)
        self.assertIn(self.request_record.patient_name, body["ai_summary"])
