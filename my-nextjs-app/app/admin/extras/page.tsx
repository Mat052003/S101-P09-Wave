"use client";
// app/admin/extras/page.tsx

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

const EXTRA_TYPES = [
  { value: "BREAKFAST",  label: "Desayuno",   icon: "🥐" },
  { value: "SPA",        label: "Spa",        icon: "💆" },
  { value: "TOUR",       label: "Tour",       icon: "🗺️" },
  { value: "TRANSPORT",  label: "Transporte", icon: "🚗" },
];

type Hotel = { id: string; name: string };
type Extra = {
  id: string; name: string; description: string | null; price: number;
  image: string | null; type: string; isActive: boolean;
  hotels: { hotel: Hotel }[];
};

export default function AdminExtrasPage() {
  const [extras, setExtras]       = useState<Extra[]>([]);
  const [myHotels, setMyHotels]   = useState<Hotel[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Extra | null>(null);

  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice]           = useState("");
  const [image, setImage]           = useState("");
  const [type, setType]             = useState("BREAKFAST");
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/extras").then((r) => r.json()),
      fetch("/api/admin/hotels").then((r) => r.json()),
    ]).then(([exts, hotels]) => {
      setExtras(exts || []);
      setMyHotels(hotels || []);
      setLoading(false);
    });
  }, []);

  function openCreate() {
    setEditing(null); setName(""); setDescription(""); setPrice("");
    setImage(""); setType("BREAKFAST"); setSelectedHotels([]);
    setError(""); setShowForm(true);
  }

  function openEdit(extra: Extra) {
    setEditing(extra); setName(extra.name); setDescription(extra.description || "");
    setPrice(extra.price.toString()); setImage(extra.image || ""); setType(extra.type);
    setSelectedHotels(extra.hotels.map((h) => h.hotel.id));
    setError(""); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError("");

    const url    = editing ? `/api/admin/extras/${editing.id}` : "/api/admin/extras";
    const method = editing ? "PATCH" : "POST";

    const res  = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, price, image: image || null, type, hotelIds: selectedHotels }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) { setError(data.error || "Error al guardar"); return; }

    if (editing) {
      setExtras((prev) => prev.map((e) => e.id === editing.id ? data : e));
    } else {
      setExtras((prev) => [data, ...prev]);
    }
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este extra?")) return;
    const res = await fetch(`/api/admin/extras/${id}`, { method: "DELETE" });
    if (res.ok) setExtras((prev) => prev.filter((e) => e.id !== id));
  }

  const inputClass = "w-full bg-white border-2 border-[#0B1F2D]/30 rounded-xl px-4 py-2.5 text-sm text-[#0B1F2D] outline-none focus:border-[#0B1F2D] transition-all";
  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.18em] text-[#0B1F2D] mb-1.5";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C9A87C] mb-1">Panel admin</p>
          <h1 className="font-display text-3xl font-bold text-[#0B1F2D]">Extras</h1>
          <p className="text-sm text-[#0B1F2D]/40 mt-1">Servicios adicionales para tus huéspedes</p>
        </div>
        <button onClick={openCreate}
          className="bg-[#0B1F2D] hover:bg-[#1B4965] text-[#FAF6F0] text-sm font-bold px-5 py-2.5 rounded-full transition-colors">
          + Nuevo extra
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0B1F2D]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAF6F0] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-[#0B1F2D] mb-6">
              {editing ? "Editar extra" : "Nuevo extra"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Tipo</label>
                <div className="grid grid-cols-4 gap-2">
                  {EXTRA_TYPES.map((t) => (
                    <button key={t.value} type="button" onClick={() => setType(t.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        type === t.value ? "border-[#C9A87C] bg-[#C9A87C]/10" : "border-[#0B1F2D]/15 bg-white hover:border-[#0B1F2D]/30"
                      }`}>
                      <span className="block text-xl mb-1">{t.icon}</span>
                      <span className="text-[10px] font-bold text-[#0B1F2D]/70">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Nombre *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Desayuno continental premium" required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Precio (USD) *</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="25" required min="0" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del servicio..." rows={2}
                  className={`${inputClass} resize-none`} />
              </div>

              <div>
                <label className={labelClass}>URL de imagen</label>
                <input type="url" value={image} onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..." className={inputClass} />
                {image && (
                  <div className="mt-2 w-full h-24 rounded-xl overflow-hidden">
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {myHotels.length > 0 && (
                <div>
                  <label className={labelClass}>Asignar a hoteles</label>
                  <div className="flex flex-wrap gap-2">
                    {myHotels.map((h) => {
                      const selected = selectedHotels.includes(h.id);
                      return (
                        <button key={h.id} type="button"
                          onClick={() => setSelectedHotels(
                            selected ? selectedHotels.filter((id) => id !== h.id) : [...selectedHotels, h.id]
                          )}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                            selected ? "bg-[#0B1F2D] text-white border-[#0B1F2D]" : "bg-white text-[#0B1F2D] border-[#0B1F2D]/20"
                          }`}>
                          {selected && "✓ "}{h.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-[#FAF6F0] border-2 border-[#0B1F2D]/20 text-[#0B1F2D] font-bold py-3 rounded-2xl">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-[#0B1F2D] hover:bg-[#1B4965] disabled:bg-[#0B1F2D]/40 text-white font-bold py-3 rounded-2xl transition-colors">
                  {submitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear extra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-[#0B1F2D]/40 text-center py-16">Cargando...</p>
      ) : extras.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-[#0B1F2D]/10 p-16 text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="font-display text-2xl font-bold text-[#0B1F2D]">Sin extras aún</h2>
          <p className="text-[#0B1F2D]/40 text-sm mt-2">Crea tu primer extra para tus huéspedes</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {extras.map((extra) => {
            const typeInfo = EXTRA_TYPES.find((t) => t.value === extra.type);
            return (
              <article key={extra.id} className="bg-white rounded-2xl border-2 border-[#0B1F2D]/10 overflow-hidden">
                {extra.image && (
                  <div className="aspect-[16/7] overflow-hidden">
                    <img src={extra.image} alt={extra.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeInfo?.icon}</span>
                      <div>
                        <h3 className="font-bold text-sm text-[#0B1F2D]">{extra.name}</h3>
                        <p className="text-[10px] text-[#0B1F2D]/40 uppercase tracking-wider">{typeInfo?.label}</p>
                      </div>
                    </div>
                    <p className="font-display text-lg font-bold text-[#0B1F2D] shrink-0">${extra.price}</p>
                  </div>

                  {extra.description && (
                    <p className="text-xs text-[#0B1F2D]/50 line-clamp-2 mb-2">{extra.description}</p>
                  )}

                  {extra.hotels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {extra.hotels.map((h) => (
                        <span key={h.hotel.id} className="text-[10px] bg-[#0B1F2D]/5 text-[#0B1F2D]/50 px-2 py-0.5 rounded-full">
                          🏨 {h.hotel.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => openEdit(extra)}
                      className="flex-1 bg-[#0B1F2D] hover:bg-[#1B4965] text-white text-xs font-bold py-2 rounded-xl transition-colors">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(extra.id)}
                      className="px-3 bg-rose-50 border-2 border-rose-200 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl">
                      🗑️
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}