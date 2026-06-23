"use client";
// app/admin/hotels/page.tsx
// Lista de hoteles del admin (separada del dashboard)

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Hotel = {
  id: string;
  name: string;
  location: string;
  price: number;
  stars: number;
  images: string[];
  isActive: boolean;
  totalRooms: number;
  _count: { reservations: number };
};

export default function AdminHotelsPage() {
  const router = useRouter();
  const [hotels, setHotels]   = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/hotels")
      .then((r) => {
        if (r.status === 401) { router.push("/auth/login"); return null; }
        if (r.status === 403) { router.push("/dashboard"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setHotels(data); setLoading(false); });
  }, [router]);

  async function deleteHotel(id: string) {
    if (!confirm("¿Eliminar este hotel? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/admin/hotels/${id}`, { method: "DELETE" });
    if (res.ok) setHotels((prev) => prev.filter((h) => h.id !== id));
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-[#0B1F2D]/40">Cargando hoteles...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C9A87C] mb-1">Panel admin</p>
          <h1 className="font-display text-3xl font-bold text-[#0B1F2D]">Mis hoteles</h1>
        </div>
        <Link href="/admin/hotels/new"
          className="bg-[#0B1F2D] hover:bg-[#1B4965] text-[#FAF6F0] text-sm font-bold px-5 py-2.5 rounded-full transition-colors">
          + Agregar hotel
        </Link>
      </div>

      {hotels.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-[#0B1F2D]/10 p-16 text-center">
          <div className="text-5xl mb-4">🏨</div>
          <h2 className="font-display text-2xl font-bold text-[#0B1F2D]">Aún no tienes hoteles</h2>
          <p className="text-[#0B1F2D]/50 text-sm mt-2 mb-6">Agrega tu primer hotel boutique</p>
          <Link href="/admin/hotels/new"
            className="inline-block bg-[#0B1F2D] hover:bg-[#1B4965] text-[#FAF6F0] text-sm font-bold px-6 py-3 rounded-full transition-colors">
            + Agregar mi primer hotel
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {hotels.map((hotel) => (
            <article key={hotel.id} className="bg-white rounded-2xl border-2 border-[#0B1F2D]/10 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[16/9] bg-[#EEF0EB] relative">
                {hotel.images?.[0] ? (
                  <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#0B1F2D]/20 text-4xl">🏨</div>
                )}
                <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
                  hotel.isActive ? "bg-teal-100 text-teal-700" : "bg-rose-100 text-rose-700"
                }`}>
                  {hotel.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-[#0B1F2D]">{hotel.name}</h3>
                    <p className="text-xs text-[#0B1F2D]/40">📍 {hotel.location}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <span key={i} className="text-[#C9A87C] text-xs">★</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="font-display text-xl font-bold text-[#0B1F2D]">${hotel.price.toLocaleString()}<span className="text-xs font-normal text-[#0B1F2D]/40">/noche</span></span>
                  <div className="flex gap-3 text-xs text-[#0B1F2D]/40">
                    <span>🛏️ {hotel.totalRooms} hab.</span>
                    <span>📋 {hotel._count.reservations} reservas</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/hotels/${hotel.id}/edit`}
                    className="flex-1 text-center bg-[#0B1F2D] hover:bg-[#1B4965] text-[#FAF6F0] text-xs font-bold py-2.5 rounded-xl transition-colors">
                    Editar
                  </Link>
                  <Link href={`/admin/hotels/${hotel.id}/reservations`}
                    className="flex-1 text-center bg-white border-2 border-[#0B1F2D]/20 hover:border-[#0B1F2D]/40 text-[#0B1F2D] text-xs font-bold py-2.5 rounded-xl transition-colors">
                    Reservas
                  </Link>
                  <Link href={`/hotels/${hotel.id}`}
                    className="px-3 bg-white border-2 border-[#0B1F2D]/20 hover:border-[#0B1F2D]/40 text-[#0B1F2D] text-xs font-bold rounded-xl transition-colors">
                    👁️
                  </Link>
                  <button onClick={() => deleteHotel(hotel.id)}
                    className="px-3 bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-600 text-xs font-bold rounded-xl transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}