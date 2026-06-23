"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function NewHotelPage() {
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  async function handleSync() {
    setSyncing(true);
    const res = await fetch("/api/admin/sync-google-hotels", { method: "POST" });
    setSyncing(false);
    if (res.ok) {
      alert("Hoteles sincronizados exitosamente");
      router.push("/admin/hotels");
    } else {
      alert("Error al sincronizar hoteles");
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/admin/hotels" className="text-sm text-teal-600 font-bold mb-6 inline-block">
          ← Volver a mis hoteles
        </Link>
        <h1 className="text-3xl font-black mb-4">Importador Mágico de Hoteles</h1>
        
        <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm text-center max-w-xl mx-auto">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-xl font-bold mb-3 text-[#153243]">Añadir Hoteles Automáticamente</h2>
          <p className="text-[#284B63] mb-8 text-sm leading-relaxed">
            Hemos desactivado la creación manual de hoteles temporalmente. En su lugar, usa nuestro motor de sincronización. Con un solo clic, buscaremos y añadiremos automáticamente hoteles boutique reales desde Google Maps a tu base de datos, incluyendo fotos, ubicación y reseñas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleSync} 
              disabled={syncing}
              className="inline-block bg-[#284B63] text-[#F4F9E9] font-bold px-8 py-3.5 rounded-xl hover:bg-[#153243] disabled:opacity-50 transition-colors shadow-sm"
            >
              {syncing ? "Buscando y Sincronizando..." : "Sincronizar desde Google"}
            </button>
            <Link href="/admin/hotels" className="inline-block bg-[#EEF0EB] text-[#153243] border border-[#153243]/20 font-bold px-8 py-3.5 rounded-xl hover:bg-[#F4F9E9] transition-colors">
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
