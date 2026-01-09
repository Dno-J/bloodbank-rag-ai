// frontend/src/app/requests/new/page.tsx
// Request creation form at http://localhost:3000/requests/new

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const STATUS_OPTIONS = ["pending", "approved", "fulfilled", "rejected"];

interface Hospital {
  id: number;
  name: string;
}

export default function NewRequestPage() {
  const router = useRouter();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [form, setForm] = useState({
    patient_name: "",
    patient_age: "",
    blood_group: "",
    hospital: "",
    units_requested: "",
    status: "pending",
  });

  useEffect(() => {
    async function fetchHospitals() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/hospitals/`,
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      setHospitals(data);
    }
    fetchHospitals();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      patient_name: form.patient_name,
      patient_age: Number(form.patient_age),
      blood_group: form.blood_group,
      hospital: Number(form.hospital),
      units_requested: Number(form.units_requested),
      status: form.status,
    };

    await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/requests/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    router.push("/requests");
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-6">Add New Request</h1>

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
            min={0}
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
            <option value="">Select Blood Group</option>
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
            <option value="">Select Hospital</option>
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
            min={1}
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

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
