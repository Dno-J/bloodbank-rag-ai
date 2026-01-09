// frontend/src/app/donors/[id]/edit/page.tsx
// Edit donor at http://localhost:3000/donors/id/edit

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditDonorPage() {
  const router = useRouter();
  const params = useParams();
  const donorId = params.id;

  const [form, setForm] = useState({
    name: "",
    age: "",
    blood_group: "",
    contact: "",
    city: "",
  });

  const [loading, setLoading] = useState(true);

  // 🔹 Fetch existing donor
  useEffect(() => {
    async function fetchDonor() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/donors/${donorId}/`
        );
        const data = await res.json();

        setForm({
          name: data.name,
          age: data.age.toString(),
          blood_group: data.blood_group,
          contact: data.contact,
          city: data.city,
        });
      } catch (err) {
        console.error("Failed to load donor", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDonor();
  }, [donorId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/donors/${donorId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            age: Number(form.age),
          }),
        }
      );

      router.push("/donors");
    } catch (err) {
      console.error("Error updating donor:", err);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this donor?")) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/donors/${donorId}/`,
        { method: "DELETE" }
      );

      router.push("/donors");
    } catch (err) {
      console.error("Error deleting donor:", err);
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading donor...</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-6">Edit Donor</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(form).map((field) => (
            <input
              key={field}
              className="input"
              placeholder={field.replace("_", " ")}
              value={(form as any)[field]}
              onChange={(e) =>
                setForm({ ...form, [field]: e.target.value })
              }
              required
            />
          ))}

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
