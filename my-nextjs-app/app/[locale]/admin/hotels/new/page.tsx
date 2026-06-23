"use client";

import { Link } from "@/i18n/navigation";

export default function NewHotelPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/admin" className="text-sm text-teal-600 font-bold mb-6 inline-block">
          ← Volver al panel
        </Link>
        <h1 className="text-3xl font-black mb-4">Añadir Nuevo Hotel</h1>
        
        <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm text-center">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-bold mb-2">Página en Construcción</h2>
          <p className="text-stone-500 mb-6">
            El formulario manual para crear hoteles estará disponible pronto. Por ahora, te recomendamos usar el botón <strong>"Sincronizar Google Hotels"</strong> en el panel anterior para importar hoteles reales automáticamente.
          </p>
          <Link href="/admin" className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-600 transition-colors">
            Entendido, volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
