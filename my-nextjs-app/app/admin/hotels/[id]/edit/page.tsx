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

  useEffect(() => {
    fetch(`/api/admin/hotels/${hotelId}`)
      .then((r) => {
        if (r.status === 403 || r.status === 401) { router.push("/admin"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setHotel(data);
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

  if (!hotel) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white border-b border-stone-100 px-8 h-16 flex items-center justify-between sticky top-0 z-10">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">W</span>
          </div>
          <span className="text-lg font-bold text-slate-900">Wave<span className="text-teal-500">.</span></span>
        </Link>
        <Link href="/admin" className="text-sm text-stone-500 hover:text-slate-900">
          ← Volver
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 mb-2">Editar hotel</p>
          <h1 className="text-3xl font-black text-slate-900">{hotel.name}</h1>
        </header>

        <HotelForm mode="edit" hotelId={hotelId} initialData={hotel} />
      </div>
    </div>
  );
}
