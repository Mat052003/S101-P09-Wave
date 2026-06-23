"use client";
// app/admin/experiences/page.tsx

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  ACTIVITY:   "Actividad",
  GASTRONOMY: "Gastronomía",
  TOUR:       "Tour",
  WELLNESS:   "Wellness",
  ADVENTURE:  "Aventura",
};

const CATEGORY_ICONS: Record<string, string> = {
  ACTIVITY:   "🚵",
  GASTRONOMY: "🍷",
  TOUR:       "🗺️",
  WELLNESS:   "🧘",
  ADVENTURE:  "🏔️",
};

type Hotel = { id: string; name: string };
type Experience = {
  id: string; name: string; description: string; price: number;
  duration: string | null; category: string; images: string[]; isActive: boolean;
  hotels: { hotel: Hotel }[];
};

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [myHotels, setMyHotels]       = useState<Hotel[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState<Experience | null>(null);

  // Form state
  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice]           = useState("");
  const [duration, setDuration]     = useState("");
  const [category, setCategory]     = useState("ACTIVITY");
  const [imageUrl, setImageUrl]     = useState("");
  const [images, setImages]         = useState<string[]>([]);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/experiences").then((r) => r.json()),
      fetch("/api/admin/hotels").then((r) => r.json()),
    ]).then(([exps, hotels]) => {
      setExperiences(exps || []);
      setMyHotels(hotels || []);
      setLoading(false);
    });
  }, []);

  function openCreate() {
    setEditing(null); setName(""); setDescription(""); setPrice("");
    setDuration(""); setCategory("ACTIVITY"); setImages([]); setSelectedHotels([]);
    setError(""); setShowForm(true);
  }

  function openEdit(exp: Experience) {
    setEditing(exp); setName(exp.name); setDescription(exp.description);
    setPrice(exp.price.toString()); setDuration(exp.duration || "");
    setCategory(exp.category); setImages(exp.images);
    setSelectedHotels(exp.hotels.map((h) => h.hotel.id));
    setError(""); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError("");

    const url    = editing ? `/api/admin/experiences/${editing.id}` : "/api/admin/experiences";
    const method = editing ? "PATCH" : "POST";

    const res  = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, price, duration, category, images, hotelIds: selectedHotels }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) { setError(data.error || "Error al guardar"); return; }

    if (editing) {
      setExperiences((prev) => prev.map((e) => e.id === editing.id ? data : e));
    } else {
      setExperiences((prev) => [data, ...prev]);
    }
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta experiencia?")) return;
    const res = await fetch(`/api/admin/experiences/${id}`, { method: "DELETE" });
    if (res.ok) setExperiences((prev) => prev.filter((e) => e.id !== id));
  }

  const inputClass = "w-full bg-white border-2 border-[#0B1F2D]/30 rounded-xl px-4 py-2.5 text-sm text-[#0B1F2D] outline-none focus:border-[#0B1F2D] transition-all";
  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.18em] text-[#0B1F2D] mb-1.5";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C9A87C] mb-1">Panel admin</p>
          <h1 className="font-display text-3xl font-bold text-[#0B1F2D]">Experiencias</h1>
          <p className="text-sm text-[#0B1F2D]/40 mt-1">Crea experiencias únicas y asígnalas a tus hoteles</p>
        </div>
        <button onClick={openCreate}
          className="bg-[#0B1F2D] hover:bg-[#1B4965] text-[#FAF6F0] text-sm font-bold px-5 py-2.5 rounded-full transition-colors">
          + Nueva experiencia
        </button>
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0B1F2D]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAF6F0] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-[#0B1F2D] mb-6">
              {editing ? "Editar experiencia" : "Nueva experiencia"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Caminata a caballo al volcán" required className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Precio (USD) *</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="85" required min="0" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Duración</label>
                  <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                    placeholder="Ej: 3 horas, Medio día" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Categoría</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setCategory(val)}
                      className={`p-2 rounded-xl border-2 text-center transition-all ${
                        category === val ? "border-[#C9A87C] bg-[#C9A87C]/10" : "border-[#0B1F2D]/15 hover:border-[#0B1F2D]/30"
                      }`}>
                      <span className="block text-xl mb-1">{CATEGORY_ICONS[val]}</span>
                      <span className="text-[10px] font-bold text-[#0B1F2D]/70">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Descripción *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe la experiencia..." rows={3} required
                  className={`${inputClass} resize-none`} />
              </div>

              {/* Imágenes */}
              <div>
                <label className={labelClass}>Imágenes (URLs)</label>
                <div className="flex gap-2">
                  <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..." className={`${inputClass} flex-1`} />
                  <button type="button"
                    onClick={() => { if (imageUrl.trim()) { setImages([...images, imageUrl.trim()]); setImageUrl(""); }}}
                    className="bg-[#0B1F2D] text-white text-xs font-bold px-4 py-2 rounded-xl">
                    +
                  </button>
                </div>
                {images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-lg transition-opacity">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hoteles */}
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
                  {submitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear experiencia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-[#0B1F2D]/40 text-center py-16">Cargando...</p>
      ) : experiences.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-[#0B1F2D]/10 p-16 text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="font-display text-2xl font-bold text-[#0B1F2D]">Sin experiencias aún</h2>
          <p className="text-[#0B1F2D]/40 text-sm mt-2">Crea tu primera experiencia boutique</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {experiences.map((exp) => (
            <article key={exp.id} className="bg-white rounded-2xl border-2 border-[#0B1F2D]/10 overflow-hidden">
              {exp.images?.[0] && (
                <div className="aspect-[16/7] overflow-hidden">
                  <img src={exp.images[0]} alt={exp.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{CATEGORY_ICONS[exp.category]}</span>
                      <span className="text-xs text-[#0B1F2D]/40 font-semibold uppercase tracking-wider">
                        {CATEGORY_LABELS[exp.category]}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#0B1F2D]">{exp.name}</h3>
                    {exp.duration && <p className="text-xs text-[#0B1F2D]/40">⏱ {exp.duration}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl font-bold text-[#0B1F2D]">${exp.price}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${exp.isActive ? "bg-teal-100 text-teal-700" : "bg-rose-100 text-rose-700"}`}>
                      {exp.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#0B1F2D]/55 line-clamp-2 mb-3">{exp.description}</p>

                {exp.hotels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {exp.hotels.map((h) => (
                      <span key={h.hotel.id} className="text-[10px] bg-[#0B1F2D]/5 text-[#0B1F2D]/60 px-2 py-0.5 rounded-full">
                        🏨 {h.hotel.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => openEdit(exp)}
                    className="flex-1 bg-[#0B1F2D] hover:bg-[#1B4965] text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(exp.id)}
                    className="px-3 bg-rose-50 border-2 border-rose-200 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors">
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