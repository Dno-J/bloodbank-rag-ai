// frontend/src/app/hospitals/new/page.tsx
// Hospital creation form at http://localhost:3000/hospitals/new

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewHospitalPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    location: "",
    contact: "",
    capacity: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/hospitals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity),
        }),
      });

      router.push("/hospitals");
    } catch (err) {
      console.error("Error creating hospital:", err);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-6">
          Add New Hospital
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input"
            placeholder="Hospital Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            className="input"
            placeholder="City"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
            required
          />

          <input
            className="input"
            placeholder="Contact Number"
            value={form.contact}
            onChange={(e) =>
              setForm({ ...form, contact: e.target.value })
            }
            required
          />

          <input
            type="number"
            className="input"
            placeholder="Capacity (Beds)"
            min={0}
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: e.target.value })
            }
            required
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-outline"
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              Save Hospital
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
