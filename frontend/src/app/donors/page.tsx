// frontend/src/app/donors/page.tsx
// Donors page at http://localhost:3000/donors

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Donor {
  id: number;
  name: string;
  age: number;
  blood_group: string;
  contact: string;
  city: string;
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDonors() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/donors/`,
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      setDonors(data);
      setLoading(false);
    }

    fetchDonors();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this donor?")) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/donors/${id}/`,
      { method: "DELETE" }
    );

    setDonors((prev) => prev.filter((d) => d.id !== id));
  }

  if (loading) {
    return <div className="py-12 text-center">Loading donors...</div>;
  }

  return (
    <section className="section">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Donors</h1>

        <button
          className="btn btn-primary"
          onClick={() => router.push("/donors/new")}
        >
          + Add Donor
        </button>
      </div>

      {/* Table Wrapper (CRITICAL FIX) */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Blood Group</th>
              <th>Contact</th>
              <th>City</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {donors.map((donor) => (
              <tr key={donor.id}>
                <td>{donor.name}</td>
                <td>{donor.age}</td>
                <td>{donor.blood_group}</td>
                <td>{donor.contact}</td>
                <td>{donor.city}</td>

                <td className="text-right space-x-2">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      router.push(`/donors/${donor.id}/edit`)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(donor.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {donors.length === 0 && (
          <div className="empty-state">
            No donors found. Add your first donor.
          </div>
        )}
      </div>
    </section>
  );
}
