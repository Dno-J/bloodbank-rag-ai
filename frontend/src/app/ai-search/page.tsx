"use client";

import { useState } from "react";

type SearchResult = {
  type: "donor" | "hospital" | "request";
  metadata: any;
  score: number;
};

export default function AISearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setSummary("");

    try {
      const res = await fetch("/api/ai/search/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResults(data.results || []);
      setSummary(data.ai_summary || "");
    } catch (err) {
      console.error("AI search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="section max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold mb-2">
            AI Semantic Search
          </h1>
          <p className="text-[var(--text-secondary)]">
            Query donors, hospitals, and requests using natural language powered by RAG.
          </p>
        </div>

        {/* Search */}
        <div className="card mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. O+ donors in Udaipur"
              className="input flex-1"
            />
            <button
              onClick={handleSearch}
              className="btn btn-primary whitespace-nowrap"
              disabled={loading}
            >
              {loading ? "Searching..." : "Run AI Search"}
            </button>
          </div>
        </div>

        {/* AI Summary */}
        {summary && (
          <div className="card mb-10 border-l-4 border-red-600">
            <h3 className="text-sm font-medium mb-2 text-[var(--text-secondary)]">
              AI Summary
            </h3>
            <p className="text-[var(--text-primary)]">{summary}</p>
          </div>
        )}

        {/* Results */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">
            Matched Records
          </h3>

          {loading ? (
            <div className="empty-state">Running semantic search…</div>
          ) : results.length === 0 ? (
            <div className="empty-state">
              No results found. Try a different query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((r, idx) => (
                <ResultCard key={idx} result={r} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* --------------------------------
   Result Card
--------------------------------- */

function ResultCard({ result }: { result: SearchResult }) {
  const { type, metadata, score } = result;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wide font-semibold text-[var(--text-secondary)]">
          {type}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          relevance {score.toFixed(2)}
        </span>
      </div>

      {type === "donor" && <DonorCard data={metadata} />}
      {type === "hospital" && <HospitalCard data={metadata} />}
      {type === "request" && <RequestCard data={metadata} />}
    </div>
  );
}

/* --------------------------------
   Entity Cards
--------------------------------- */

function DonorCard({ data }: { data: any }) {
  return (
    <>
      <h4 className="font-semibold text-lg mb-3">{data.name}</h4>
      <ul className="text-sm text-[var(--text-secondary)] space-y-1">
        <li><strong>Age:</strong> {data.age ?? "—"}</li>
        <li><strong>Blood Group:</strong> {data.blood_group ?? "—"}</li>
        <li><strong>City:</strong> {data.city ?? "—"}</li>
        <li><strong>Contact:</strong> {data.contact ?? "—"}</li>
      </ul>
    </>
  );
}

function HospitalCard({ data }: { data: any }) {
  return (
    <>
      <h4 className="font-semibold text-lg mb-3">{data.name}</h4>
      <ul className="text-sm text-[var(--text-secondary)] space-y-1">
        <li><strong>Location:</strong> {data.location ?? "—"}</li>
        <li><strong>Capacity:</strong> {data.capacity ?? "—"}</li>
        <li><strong>Contact:</strong> {data.contact ?? "—"}</li>
      </ul>
    </>
  );
}

function RequestCard({ data }: { data: any }) {
  return (
    <>
      <h4 className="font-semibold text-lg mb-3">
        {data.blood_group} Blood Required
      </h4>
      <ul className="text-sm text-[var(--text-secondary)] space-y-1">
        <li>
          <strong>Patient:</strong> {data.patient_name} ({data.patient_age})
        </li>
        <li><strong>Units Requested:</strong> {data.units_requested}</li>
        <li><strong>Hospital:</strong> {data.hospital}</li>
        <li><strong>Status:</strong> {data.status}</li>
      </ul>
    </>
  );
}
