"use client";
// app/admin/page.tsx

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
  _count: { reservations: number };
};

export default function AdminDashboard() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/hotels")
      .then((r) => {
        if (r.status === 401) { router.push("/auth/login"); return null; }
        if (r.status === 403) { router.push("/dashboard"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setHotels(data);
        setLoading(false);
      });
  }, [router]);

  async function deleteHotel(id: string) {
    if (!confirm("¿Eliminar este hotel? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/admin/hotels/${id}`, { method: "DELETE" });
    if (res.ok) setHotels((prev) => prev.filter((h) => h.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* SIN navbar propio — el global ya lo incluye */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 mb-2">Panel de anfitrión</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mis hoteles</h1>
            <p className="text-stone-500 mt-2">Gestiona tus propiedades, precios y disponibilidad.</p>
          </div>
          <Link href="/admin/hotels/new"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors">
            + Agregar hotel
          </Link>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <p className="text-3xl font-black text-slate-900">{hotels.length}</p>
            <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Hoteles publicados</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <p className="text-3xl font-black text-slate-900">
              {hotels.reduce((sum, h) => sum + h._count.reservations, 0)}
            </p>
            <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Total reservas</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <p className="text-3xl font-black text-slate-900">
              {hotels.length > 0 ? `$${Math.round(hotels.reduce((sum, h) => sum + h.price, 0) / hotels.length).toLocaleString()}` : "$0"}
            </p>
            <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Precio promedio</p>
          </div>
        </div>

        {/* Lista de hoteles */}
        {hotels.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-100 p-16 text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">🏨</div>
            <h2 className="text-xl font-bold text-slate-900">Aún no tienes hoteles publicados</h2>
            <p className="text-stone-500 text-sm mt-2 max-w-sm mx-auto">
              Agrega tu primer hotel boutique y empieza a recibir reservas.
            </p>
            <Link href="/admin/hotels/new"
              className="inline-block mt-6 bg-slate-900 hover:bg-teal-600 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
              + Agregar mi primer hotel
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {hotels.map((hotel) => (
              <article key={hotel.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[16/9] bg-stone-100 relative">
                  {hotel.images?.[0] ? (
                    <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">🏨</div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{hotel.name}</h3>
                      <p className="text-xs text-stone-400">📍 {hotel.location}</p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {[...Array(hotel.stars)].map((_, i) => (
                        <span key={i} className="text-amber-400 text-xs">★</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-xl font-black text-slate-900">${hotel.price.toLocaleString()}</span>
                      <span className="text-xs text-stone-400"> /noche</span>
                    </div>
                    <span className="text-xs text-stone-500 bg-stone-50 px-2 py-1 rounded-full">
                      {hotel._count.reservations} reservas
                    </span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link href={`/admin/hotels/${hotel.id}/edit`}
                      className="flex-1 text-center bg-slate-900 hover:bg-teal-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                      Editar
                    </Link>
                    <Link href={`/admin/hotels/${hotel.id}/reservations`}
                      className="flex-1 text-center bg-white border border-stone-200 hover:border-teal-400 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors">
                      Ver reservas
                    </Link>
                    <Link href={`/hotels/${hotel.id}`}
                      className="flex-1 text-center bg-white border border-stone-200 hover:border-stone-400 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors">
                      Ver público
                    </Link>
                    <button onClick={() => deleteHotel(hotel.id)}
                      className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors">
                      🗑️
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
