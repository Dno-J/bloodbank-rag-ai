// frontend/src/app/requests/page.tsx
// Requests page at http://localhost:3000/requests

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Request {
  id: number;
  patient_name: string;
  patient_age: number;
  blood_group: string;
  hospital: string;
  units_requested: number;
  status: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRequests() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/requests/`,
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      setRequests(data);
      setLoading(false);
    }

    fetchRequests();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this request?")) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/requests/${id}/`,
      { method: "DELETE" }
    );

    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) {
    return <div className="py-12 text-center">Loading requests...</div>;
  }

  return (
    <section className="section">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Requests</h1>

        <button
          className="btn btn-primary"
          onClick={() => router.push("/requests/new")}
        >
          + Add Request
        </button>
      </div>

      {/* Table Wrapper (CRITICAL FIX) */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Blood Group</th>
              <th>Hospital</th>
              <th>Units</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.patient_name}</td>
                <td>{req.patient_age}</td>
                <td>{req.blood_group}</td>
                <td>{req.hospital}</td>
                <td>{req.units_requested}</td>
                <td className="capitalize">{req.status}</td>

                <td className="text-right space-x-2">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      router.push(`/requests/${req.id}/edit`)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(req.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {requests.length === 0 && (
          <div className="empty-state">
            No requests yet. Create the first request.
          </div>
        )}
      </div>
    </section>
  );
}
