"use client";
// app/admin/hotels/new/page.tsx

export const dynamic = "force-dynamic";

import Link from "next/link";
import HotelForm from "@/app/components/hotel-form";

export default function NewHotelPage() {
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 mb-2">Nuevo hotel</p>
          <h1 className="text-3xl font-black text-slate-900">Publica tu hotel</h1>
          <p className="text-stone-500 mt-1 text-sm">Completa los datos para que viajeros puedan reservarlo.</p>
        </header>

        <HotelForm mode="create" />
      </div>
    </div>
  );
}
