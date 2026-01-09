# core/utils.py

import re
from sentence_transformers import SentenceTransformer
from core import mongo

# EMBEDDING MODEL (loaded once at startup)

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text: str) -> list:
    """
    Generate vector embedding for a query or record.
    """
    embedding = embedding_model.encode(text)
    return embedding.tolist()

# QUERY PARSING HELPERS

def extract_entity_type(query: str):
    """
    Detect primary entity intent from query.
    """
    q = query.lower()
    if "donor" in q:
        return "donor"
    if "hospital" in q:
        return "hospital"
    if "request" in q or "patient" in q:
        return "request"
    return None


def extract_blood_group(query: str):
    blood_groups = ["a+", "a-", "b+", "b-", "ab+", "ab-", "o+", "o-"]
    q = query.lower()
    for bg in blood_groups:
        if bg in q:
            return bg.upper()
    return None


def extract_age_filter(query: str):
    """
    Extract numeric age conditions.
    """
    q = query.lower()

    gt = re.search(r"(above|older than|greater than)\s*(\d+)", q)
    if gt:
        return ("gt", int(gt.group(2)))

    lt = re.search(r"(below|less than|under)\s*(\d+)", q)
    if lt:
        return ("lt", int(lt.group(2)))

    eq = re.search(r"(age is|aged|age)\s*(\d+)", q)
    if eq:
        return ("eq", int(eq.group(2)))

    return None


def extract_capacity_filter(query: str):
    """
    Extract hospital capacity conditions.
    """
    q = query.lower()

    gt = re.search(r"capacity.*?(above|greater than)\s*(\d+)", q)
    if gt:
        return ("gt", int(gt.group(2)))

    lt = re.search(r"capacity.*?(below|less than)\s*(\d+)", q)
    if lt:
        return ("lt", int(lt.group(2)))

    eq = re.search(r"capacity.*?(is)?\s*(\d+)", q)
    if eq:
        return ("eq", int(eq.group(2)))

    return None


def extract_status_filter(query: str):
    """
    Extract request status.
    """
    q = query.lower()
    for status in ["pending", "fulfilled", "approved", "rejected"]:
        if status in q:
            return status
    return None

# VECTOR SEARCH (HYBRID: STRUCTURED + SEMANTIC)

def vector_search(
    embedding: list,
    top_k: int = 5,
    filters: dict | None = None,
    strict: bool = True,
    query: str | None = None,
) -> list:

    raw_results = mongo.search(embedding, top_k=50) or []

    if not query:
        return []

    entity_type = extract_entity_type(query)
    age_filter = extract_age_filter(query)
    capacity_filter = extract_capacity_filter(query)
    status_filter = extract_status_filter(query)

    # 🔒 DOMAIN GUARD — unrelated queries should return nothing
    if not entity_type:
        return []

    filtered = []

    for r in raw_results:
        meta = r.get("metadata", {})

        # ENTITY TYPE FILTER
        if r.get("type") != entity_type:
            continue

        # STRUCTURED METADATA FILTERS (blood group, city, hospital)
        if filters:
            mismatch = False
            for k, v in filters.items():
                if meta.get(k) != v:
                    mismatch = True
                    break
            if mismatch:
                continue

        # AGE FILTER (donor / request)
        if age_filter:
            if r.get("type") == "donor":
                age = meta.get("age")
            elif r.get("type") == "request":
                age = meta.get("patient_age")
            else:
                continue

            if age is None:
                continue

            age = int(age)
            mode, value = age_filter

            if mode == "gt" and age <= value:
                continue
            if mode == "lt" and age >= value:
                continue
            if mode == "eq" and age != value:
                continue

        # CAPACITY FILTER (hospital only)
        if capacity_filter:
            if r.get("type") != "hospital":
                continue

            capacity = meta.get("capacity")
            if capacity is None:
                continue

            capacity = int(capacity)
            mode, value = capacity_filter

            if mode == "gt" and capacity <= value:
                continue
            if mode == "lt" and capacity >= value:
                continue
            if mode == "eq" and capacity != value:
                continue

        # REQUEST STATUS FILTER
        if status_filter:
            if r.get("type") != "request":
                continue
            if meta.get("status") != status_filter:
                continue

        filtered.append(r)

    # STRICT NUMERIC QUERIES → no semantic fallback
    if age_filter or capacity_filter or status_filter:
        return filtered[:top_k]

    # NON-STRICT → semantic fallback allowed
    if not filtered and not strict:
        return raw_results[:top_k]

    return filtered[:top_k]


# VECTOR INSERT

def vector_insert(record_type: str, record_id: int, embedding: list, metadata: dict):
    mongo.insert(record_type, record_id, embedding, metadata)


# AI SUMMARY

def llm_summarize(query: str, results: list) -> str:
    summary = f"Query '{query}' returned {len(results)} results."

    if not results:
        return summary

    top = results[0]
    meta = top.get("metadata", {})

    if top.get("type") == "donor":
        label = (
            f"{meta.get('name')} "
            f"(Age {meta.get('age')}, "
            f"Blood Group {meta.get('blood_group')}, "
            f"Contact {meta.get('contact')}, "
            f"City {meta.get('city')})"
        )

    elif top.get("type") == "hospital":
        label = (
            f"{meta.get('name')} "
            f"(Location {meta.get('location')}, "
            f"Capacity {meta.get('capacity')})"
        )

    elif top.get("type") == "request":
        label = (
            f"{meta.get('patient_name')} "
            f"(Age {meta.get('patient_age')}, "
            f"Blood Group {meta.get('blood_group')}, "
            f"Units {meta.get('units_requested')}, "
            f"Status {meta.get('status')})"
        )

    else:
        label = "Unknown record"

    return summary + f" Top match: {label}."
