# core/views_ai.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core.models import Donor, Hospital
from core.utils import generate_embedding, vector_search, llm_summarize


class AISearchView(APIView):
    """
    AI Semantic Search endpoint

    - Accepts natural language query
    - Blocks out-of-domain queries
    - Applies semantic retrieval + metadata constraints
    - Returns deterministic summary
    """

    # Hard safety controls
    MIN_RELEVANCE_SCORE = 0.30
    DOMAIN_KEYWORDS = {
        "donor", "donors",
        "blood", "blood group",
        "hospital", "hospitals",
        "request", "requests",
        "patient", "patients",
        "age", "city", "location",
        "capacity", "urgent",
        "units"
    }

    def post(self, request):
        query = request.data.get("query", "").strip()

        if not query:
            return Response(
                {"error": "Query is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # DOMAIN INTENT GUARD
        q_lower = query.lower()
        if not any(keyword in q_lower for keyword in self.DOMAIN_KEYWORDS):
            return Response(
                {
                    "query": query,
                    "results": [],
                    "ai_summary": (
                        "This system only supports blood bank–related queries "
                        "about donors, hospitals, and blood requests."
                    ),
                },
                status=status.HTTP_200_OK,
            )

        try:
            # EMBEDDING
            embedding = generate_embedding(query)

            # STRUCTURED FILTERS (lightweight)
            filters = {}

            # Blood group
            blood_groups = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
            for bg in blood_groups:
                if bg.lower() in q_lower:
                    filters["blood_group"] = bg
                    break

            # City / Location
            donor_cities = Donor.objects.values_list("city", flat=True).distinct()
            hospital_locations = Hospital.objects.values_list("location", flat=True).distinct()
            all_places = set(donor_cities) | set(hospital_locations)

            for place in all_places:
                if place and place.lower() in q_lower:
                    filters["city"] = place
                    break

            # VECTOR SEARCH
            results = vector_search(
                embedding=embedding,
                top_k=10,
                filters=filters,
                strict=True,
                query=query,
            )

            # RELEVANCE THRESHOLD GUARD
            if not results or results[0].get("score", 0) < self.MIN_RELEVANCE_SCORE:
                return Response(
                    {
                        "query": query,
                        "results": [],
                        "ai_summary": "No relevant results found for this query.",
                    },
                    status=status.HTTP_200_OK,
                )

            # AI SUMMARY (deterministic)
            ai_summary = llm_summarize(query, results)

            return Response(
                {
                    "query": query,
                    "results": results,
                    "ai_summary": ai_summary,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": f"AI search failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
