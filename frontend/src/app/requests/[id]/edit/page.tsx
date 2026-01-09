// frontend/src/app/requests/[id]/edit/page.tsx
// Edit donor at http://localhost:3000/requests/id/edit

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const STATUS_OPTIONS = ["pending", "approved", "fulfilled", "rejected"];

interface Hospital {
  id: number;
  name: string;
}

export default function EditRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id;

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    patient_name: "",
    patient_age: "",
    blood_group: "",
    hospital: "",
    units_requested: "",
    status: "pending",
  });

  // 🔹 Fetch request + hospitals
  useEffect(() => {
    async function fetchData() {
      try {
        const [reqRes, hospRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/requests/${requestId}/`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/hospitals/`),
        ]);

        const reqData = await reqRes.json();
        const hospData = await hospRes.json();

        setHospitals(hospData);
        setForm({
          patient_name: reqData.patient_name,
          patient_age: reqData.patient_age.toString(),
          blood_group: reqData.blood_group,
          hospital: reqData.hospital.toString(),
          units_requested: reqData.units_requested.toString(),
          status: reqData.status,
        });
      } catch (err) {
        console.error("Failed to load request", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [requestId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/requests/${requestId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            patient_age: Number(form.patient_age),
            hospital: Number(form.hospital),
            units_requested: Number(form.units_requested),
          }),
        }
      );

      router.push("/requests");
    } catch (err) {
      console.error("Error updating request:", err);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/requests/${requestId}/`,
        { method: "DELETE" }
      );

      router.push("/requests");
    } catch (err) {
      console.error("Error deleting request:", err);
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading request...</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-6">
          Edit Request
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input"
            placeholder="Patient Name"
            value={form.patient_name}
            onChange={(e) =>
              setForm({ ...form, patient_name: e.target.value })
            }
            required
          />

          <input
            type="number"
            className="input"
            placeholder="Patient Age"
            value={form.patient_age}
            onChange={(e) =>
              setForm({ ...form, patient_age: e.target.value })
            }
            required
          />

          <select
            className="input"
            value={form.blood_group}
            onChange={(e) =>
              setForm({ ...form, blood_group: e.target.value })
            }
            required
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={form.hospital}
            onChange={(e) =>
              setForm({ ...form, hospital: e.target.value })
            }
            required
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="input"
            placeholder="Units Requested"
            value={form.units_requested}
            onChange={(e) =>
              setForm({ ...form, units_requested: e.target.value })
            }
            required
          />

          <select
            className="input"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-outline text-red-600 border-red-600"
            >
              Delete
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline"
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
