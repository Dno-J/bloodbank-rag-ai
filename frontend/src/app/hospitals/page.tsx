// frontend/src/app/hospitals/page.tsx
// Hospitals page at http://localhost:3000/hospitals

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Hospital {
  id: number;
  name: string;
  location: string;
  contact: string;
  capacity: number;
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchHospitals() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/hospitals/`,
          { headers: { Accept: "application/json" } }
        );
        const data = await res.json();
        setHospitals(data);
      } catch (err) {
        console.error("Error fetching hospitals:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHospitals();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this hospital?")) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/hospitals/${id}/`,
      { method: "DELETE" }
    );

    setHospitals((prev) => prev.filter((h) => h.id !== id));
  }

  if (loading) {
    return <div className="py-12 text-center">Loading hospitals...</div>;
  }

  return (
    <section className="section">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hospitals</h1>

        <button
          className="btn btn-primary"
          onClick={() => router.push("/hospitals/new")}
        >
          + Add Hospital
        </button>
      </div>

      {/* Table Wrapper (CRITICAL) */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Contact</th>
              <th>Capacity</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {hospitals.map((hospital) => (
              <tr key={hospital.id}>
                <td>{hospital.name}</td>
                <td>{hospital.location}</td>
                <td>{hospital.contact}</td>
                <td>{hospital.capacity}</td>

                <td className="text-right space-x-2">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      router.push(`/hospitals/${hospital.id}/edit`)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(hospital.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {hospitals.length === 0 && (
          <div className="empty-state">
            No hospitals found. Add your first hospital.
          </div>
        )}
      </div>
    </section>
  );
}
