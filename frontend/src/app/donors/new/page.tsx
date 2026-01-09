// frontend/src/app/donors/new/page.tsx
// Donor creation form at http://localhost:3000/donors/new

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDonorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    age: "",
    blood_group: "",
    contact: "",
    city: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/donors/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      router.push("/donors");
    } catch (err) {
      console.error("Error creating donor:", err);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-6">Add New Donor</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(form).map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.replace("_", " ")}
              value={(form as any)[field]}
              onChange={(e) =>
                setForm({ ...form, [field]: e.target.value })
              }
              className="input"
              required
            />
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Donor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
