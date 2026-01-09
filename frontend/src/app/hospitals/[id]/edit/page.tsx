// frontend/src/app/hospitals/[id]/edit/page.tsx
// Edit hospital at http://localhost:3000/hospitals/id/edit

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditHospitalPage() {
  const router = useRouter();
  const params = useParams();
  const hospitalId = params.id;

  const [form, setForm] = useState({
    name: "",
    location: "",
    contact: "",
    capacity: "",
  });

  const [loading, setLoading] = useState(true);

  // 🔹 Fetch existing hospital
  useEffect(() => {
    async function fetchHospital() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/hospitals/${hospitalId}/`
        );
        const data = await res.json();

        setForm({
          name: data.name,
          location: data.location,
          contact: data.contact,
          capacity: data.capacity.toString(),
        });
      } catch (err) {
        console.error("Failed to load hospital", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHospital();
  }, [hospitalId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/hospitals/${hospitalId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            capacity: Number(form.capacity),
          }),
        }
      );

      router.push("/hospitals");
    } catch (err) {
      console.error("Error updating hospital:", err);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this hospital?")) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/hospitals/${hospitalId}/`,
        { method: "DELETE" }
      );

      router.push("/hospitals");
    } catch (err) {
      console.error("Error deleting hospital:", err);
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading hospital...</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-6">
          Edit Hospital
        </h1>

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
