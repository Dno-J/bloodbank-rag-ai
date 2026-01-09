# core/mongo.py
import os
import numpy as np
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["bloodbank_ai"]
collection = db["vectors"]

def insert(record_type: str, record_id: int, embedding: list, metadata: dict):
    """
    Insert a record into the vector store.
    """
    doc = {
        "type": record_type,
        "record_id": record_id,
        "embedding": embedding,
        "metadata": metadata,
    }
    collection.update_one(
        {"type": record_type, "record_id": record_id},
        {"$set": doc},
        upsert=True
    )

def search(embedding: list, top_k: int = 5):
    """
    Naive vector search using cosine similarity.
    """
    results = []
    query_vec = np.array(embedding)

    for doc in collection.find():
        vec = np.array(doc["embedding"])
        sim = float(np.dot(vec, query_vec) / (np.linalg.norm(vec) * np.linalg.norm(query_vec) + 1e-9))
        results.append({
            "type": doc["type"],
            "record_id": doc["record_id"],
            "metadata": doc["metadata"],
            "score": sim
        })

    results = sorted(results, key=lambda x: x["score"], reverse=True)
    return results[:top_k]
