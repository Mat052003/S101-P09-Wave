"use client";
// app/admin/hotels/[id]/edit/page.tsx

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import HotelForm from "@/app/components/hotel-form";

export default function EditHotelPage() {
  const params  = useParams();
  const router  = useRouter();
  const hotelId = params.id as string;

  const [hotel, setHotel]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch(`/api/admin/hotels/${hotelId}`)
      .then((r) => {
        if (r.status === 403 || r.status === 401) {
          router.push("/admin");
          return null;
        }
        if (!r.ok) {
          setError("No se pudo cargar el hotel");
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setHotel(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar el hotel");
        setLoading(false);
      });
  }, [hotelId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400">Cargando hotel...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center flex-col gap-4">
        <p className="text-rose-500">{error || "Hotel no encontrado"}</p>
        <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-900 underline">
          ← Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-stone-500 hover:text-slate-900 transition-colors">
            ← Volver al panel
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 mt-4 mb-2">Editar hotel</p>
          <h1 className="text-3xl font-black text-slate-900">{hotel.name}</h1>
        </div>

        <HotelForm mode="edit" hotelId={hotelId} initialData={hotel} />
      </div>
    </div>
  );
}
