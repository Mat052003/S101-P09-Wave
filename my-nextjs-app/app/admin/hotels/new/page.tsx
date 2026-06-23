"use client";
// app/admin/hotels/new/page.tsx

export const dynamic = "force-dynamic";

import Link from "next/link";
import HotelForm from "@/app/components/hotel-form";

export default function NewHotelPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* SIN navbar propio — el global ya lo incluye */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-2">
          <Link href="/admin" className="text-sm text-[#0B1F2D]/50 hover:text-[#0B1F2D] transition-colors">
            ← Volver al panel
          </Link>
        </div>
        <header className="mb-8 mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C9A87C] mb-2">Nuevo hotel</p>
          <h1 className="font-display text-4xl font-bold text-[#0B1F2D]">Publica tu hotel</h1>
          <p className="text-[#0B1F2D]/50 mt-2 text-sm">Completa los datos para que viajeros puedan reservarlo.</p>
        </header>
        <HotelForm mode="create" />
      </div>
    </div>
  );
}